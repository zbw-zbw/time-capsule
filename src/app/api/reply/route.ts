import OpenAI from "openai";
import { NextRequest } from "next/server";

// In-memory dedup for concurrent requests (best-effort in serverless)
const pendingRequests = new Map<string, boolean>();

function withTimeout<T>(promise: Promise<T>, ms: number, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("AI 服务响应超时，请稍后再试"));
    }, ms);

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });

    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new Error("请求已取消"));
      });
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { letterId, content, wishes, mood, recipientTime } = body;

    // Validate required fields
    if (!content || !recipientTime) {
      return new Response(
        JSON.stringify({ error: "缺少必要字段：content, recipientTime" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Deduplication by letterId
    if (letterId && pendingRequests.has(letterId)) {
      return new Response(
        JSON.stringify({ error: "该信件正在生成回复，请勿重复请求" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    if (letterId) {
      pendingRequests.set(letterId, true);
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

    if (!apiKey || apiKey === "your-key-here") {
      if (letterId) pendingRequests.delete(letterId);
      return new Response(
        JSON.stringify({ error: "AI 服务尚未配置，请联系管理员设置 API Key" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = new OpenAI({
      apiKey,
      baseURL,
    });

    const systemPrompt = `你是"未来的我"——写信人在 ${recipientTime} 之后的自己。你需要给过去的自己写一封回信。

## 你的身份
- 你是写信人本人，只不过是 ${recipientTime} 之后的版本
- 你经历了这段时间的成长，变得更成熟、更温柔、更有智慧
- 你对过去的自己充满理解和心疼

## 回信规则

1. **语气**：温暖、真诚、像和老朋友说话。不要用"亲爱的"开头，用更自然的方式，比如"嘿"、"你好啊"、或直接称呼"过去的自己"
2. **结构**：
   - 开头：读到信的感受（简短，一两句话，要有情感共鸣）
   - 中段：回应信中提到的具体内容（焦虑、困惑、近况等），给出"未来视角"的回应
   - 愿望回应：逐条回应愿望清单，每条用一个 emoji 标记结果：
     - ✅ 实现了（约40%的愿望）
     - 📖 还在路上 / 部分实现（约40%的愿望）
     - 🔄 方向变了但有了意外收获（约20%的愿望）
     - 不要所有愿望都标"实现了"，那不真实
   - 结尾：对过去的自己说一句鼓励的话，要具体、不要鸡汤

3. **关键原则**：
   - 基于用户的真实内容回应，不要泛泛而谈
   - 要有具体的细节和场景（可以合理想象）
   - 承认有些事情没有按计划走，但强调意外的收获
   - 根据用户的心情调整语气：焦虑→安抚，难过→心疼，期待→呼应
   - 回信长度与来信长度相当，不要太长也不要太短
   - 用中文写作，自然口语化，不要文绉绉

4. **绝对不要**：
   - 不要说"我是AI"或暴露非人类身份
   - 不要给出具体的理财/医疗/法律建议
   - 不要否定用户的任何情感
   - 不要使用"加油"、"相信自己"等空洞鸡汤
   - 不要在结尾署名"未来的你"之后加任何 AI 相关说明`;

    const wishesText = wishes && wishes.length > 0
      ? `\n\n我的愿望清单：\n${wishes.map((w: string, i: number) => `${i + 1}. ${w}`).join("\n")}`
      : "";

    const moodText = mood ? `\n此刻的心情：${mood}` : "";

    const userMessage = `这是我写给 ${recipientTime} 的自己的信：\n\n${content}${wishesText}${moodText}\n\n请以"${recipientTime} 的我"的身份给我回信。`;

    const streamPromise = client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      stream: true,
      max_tokens: 2000,
      temperature: 0.8,
    });

    const stream = await withTimeout(streamPromise, 30000);

    // Convert OpenAI stream to ReadableStream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(delta));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        } finally {
          if (letterId) pendingRequests.delete(letterId);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("API /reply error:", error);
    const message =
      error instanceof Error ? error.message : "AI 服务暂时不可用，请稍后再试";

    return new Response(
      JSON.stringify({ error: message }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}
