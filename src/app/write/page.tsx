"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  type RecipientTime,
  calculateOpenDate,
  getSalutation,
  formatDateCN,
  getTodayCN,
  getMonthYearCN,
  saveLetter,
  isDemoMode,
  setDemoMode,
} from "@/lib/storage";
import { SealAnimation } from "@/components/SealAnimation";
import { useToast } from "@/components/Toast";
import { IconPen, IconEnvelope, IconSmile, IconFrown, IconZap, IconHeartBroken, IconMeh, IconLightbulb, IconWarning, IconClock } from "@/components/Icons";

const RECIPIENT_OPTIONS: RecipientTime[] = ["1年后", "6个月后", "3年后", "5年后"];

const MOODS = [
  { label: "期待", icon: IconSmile },
  { label: "焦虑", icon: IconFrown },
  { label: "充满干劲", icon: IconZap },
  { label: "有点难过", icon: IconHeartBroken },
  { label: "迷茫", icon: IconMeh },
  { label: "平静", icon: IconLightbulb },
];

const WRITE_TEMPLATES = [
  {
    id: "graduation",
    label: "毕业寄语",
    icon: "🎓",
    content: "亲爱的未来的我，当你读到这封信时，毕业已经过去很久了。此刻我正站在校园里，心中满是不舍和期待。不知道你现在在哪里？做着什么样的工作？是否还记得今天这个夏天？",
    wishes: ["找到自己热爱的事业", "和重要的朋友保持联系", "保持好奇心和学习热情"],
    mood: "期待",
  },
  {
    id: "newyear",
    label: "新年心愿",
    icon: "🎆",
    content: "新的一年开始了，我想给自己写点什么。这一年有太多想做的事情，也有太多不确定。但无论如何，我想把此刻的心情记录下来，留给未来的自己。",
    wishes: ["身体健康，每天运动", "读完 10 本好书", "学会一项新技能"],
    mood: "充满干劲",
  },
  {
    id: "reflection",
    label: "深夜独白",
    icon: "🌙",
    content: "现在是深夜，周围很安静。有些话不知道该跟谁说，所以写给未来的你。最近想了很多事情，关于生活、关于选择、关于那些还没有答案的问题。",
    wishes: ["找到内心的平静", "做出不留遗憾的选择", "珍惜身边每一个人"],
    mood: "迷茫",
  },
  {
    id: "milestone",
    label: "人生里程碑",
    icon: "⭐",
    content: "今天是一个特别的日子，我想记住这一刻的感受。未来的你，当你打开这封信的时候，希望你能微笑着回忆起今天的自己。",
    wishes: ["勇敢追求想要的生活", "不害怕失败和重新开始", "对每一天都心存感恩"],
    mood: "平静",
  },
  {
    id: "birthday",
    label: "生日愿望",
    icon: "🎂",
    content: "今天是我的生日，我想给未来的自己写封信。此刻我在想，明年的这个时候我会在做什么？身边会有谁？希望未来的你过得比现在更好。",
    wishes: ["更加了解自己", "去一个一直想去的地方旅行", "养成一个健康的习惯"],
    mood: "平静",
  },
  {
    id: "encouragement",
    label: "自我鼓励",
    icon: "💪",
    content: "最近经历了一些困难，我想给未来的自己写封信。不管现在的处境有多艰难，我相信未来的你一定已经走出来了。这封信是我对自己的承诺。",
    wishes: ["变得更强大", "不再为小事焦虑", "学会享受当下"],
    mood: "充满干劲",
  },
  {
    id: "love",
    label: "情感告白",
    icon: "💕",
    content: "有些话一直藏在心里，不知道什么时候才会说出口。我想把此刻的心情封存起来，等到未来再回看，或许那时候一切都有了答案。",
    wishes: ["勇敢表达自己的感情", "学会放下过去", "遇到一个值得珍惜的人"],
    mood: "有点难过",
  },
  {
    id: "career",
    label: "职业期许",
    icon: "💼",
    content: "工作几年了，有时候会想这条路走得对不对。写给未来的自己，希望你能告诉我答案。现在的我还有很多迷茫，但也有不少期待。",
    wishes: ["找到真正热爱的工作", "提升专业技能", "保持工作与生活的平衡"],
    mood: "焦虑",
  },
  {
    id: "travel",
    label: "旅行心愿",
    icon: "✈️",
    content: "世界那么大，我想去看看。写给未来的自己，希望你已经去了那些一直想去的地方，看到了那些梦寐以求的风景。",
    wishes: ["去 3 个没去过的国家", "拍很多好看的照片", "在旅途中认识新朋友"],
    mood: "期待",
  },
  {
    id: "gratitude",
    label: "感恩日记",
    icon: "🙏",
    content: "今天突然想感谢一些人，一些事。生命中有太多值得感恩的瞬间，我想把它们记下来，等未来再回头看的时候，一定会觉得温暖。",
    wishes: ["常怀感恩之心", "把每一天当作礼物", "对身边的人更好一些"],
    mood: "平静",
  },
];

const DRAFT_KEY = "time-capsule-draft";

interface DraftData {
  recipient: RecipientTime;
  content: string;
  wishes: string[];
  mood: string;
}

function loadDraft(): DraftData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftData;
  } catch {
    return null;
  }
}

function saveDraft(draft: DraftData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function hasContent(draft: DraftData): boolean {
  return (
    draft.content.trim().length > 0 ||
    draft.wishes.some((w) => w.trim().length > 0) ||
    draft.mood !== "" ||
    draft.recipient !== "1年后"
  );
}

export default function WritePage() {
  const router = useRouter();
  const toast = useToast();

  // Load draft on mount
  const [recipient, setRecipient] = useState<RecipientTime>("1年后");
  const [content, setContent] = useState("");
  const [wishes, setWishes] = useState<string[]>(["", "", ""]);
  const [mood, setMood] = useState("");

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setRecipient(draft.recipient);
      setContent(draft.content);
      setWishes(draft.wishes.length > 0 ? draft.wishes : ["", "", ""]);
      setMood(draft.mood);
      if (hasContent(draft)) {
        toast.info("已恢复上次未完成的草稿");
      }
    }
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sealedId, setSealedId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors] = useState<{ content?: string; wishes?: string; mood?: string }>({});
  const [contentFocus, setContentFocus] = useState(false);
  const [focusedWishIndex, setFocusedWishIndex] = useState<number | null>(null);
  const [moodAnimKey, setMoodAnimKey] = useState<string | null>(null);
  const [demoMode, setDemoModeLocal] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const draftRef = useRef<DraftData>({ recipient: "1年后", content: "", wishes: ["", "", ""], mood: "" });

  useEffect(() => {
    setDemoModeLocal(isDemoMode());
  }, []);

  const openDate = useMemo(() => calculateOpenDate(recipient, demoMode), [recipient, demoMode]);
  const salutation = useMemo(() => getSalutation(recipient), [recipient]);

  // Sync ref for beforeunload check
  useEffect(() => {
    draftRef.current = { recipient, content, wishes, mood };
  }, [recipient, content, wishes, mood]);

  // Auto-save draft every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const draft: DraftData = { recipient, content, wishes, mood };
      if (hasContent(draft)) {
        saveDraft(draft);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [recipient, content, wishes, mood]);

  // beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasContent(draftRef.current)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Auto-resize textarea (smooth, no jump)
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setActiveTemplateId(null);
    if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
    // Auto-resize textarea
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 500) + "px";
  };

  // Wishes handlers
  const updateWish = (index: number, value: string) => {
    setWishes((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (errors.wishes) setErrors((prev) => ({ ...prev, wishes: undefined }));
  };

  const removeWish = (index: number) => {
    setWishes((prev) => prev.filter((_, i) => i !== index));
  };

  const addWish = () => {
    if (wishes.length >= 6) return;
    setWishes((prev) => [...prev, ""]);
  };

  // Mood select with bounce animation
  const handleMoodSelect = (m: string) => {
    setMood(m);
    setMoodAnimKey(m + Date.now());
    if (errors.mood) setErrors((prev) => ({ ...prev, mood: undefined }));
  };

  // Validation
  const validate = useCallback((): boolean => {
    const errs: typeof errors = {};
    if (content.trim().length < 10) {
      errs.content = "再多写几句吧，至少 10 字，未来的你想听到更多";
    }
    const nonEmptyWishes = wishes.filter((w) => w.trim().length > 0);
    if (nonEmptyWishes.length < 1) {
      errs.wishes = "至少写下一个愿望或目标，让未来的你有努力的方向";
    }
    if (!mood) {
      errs.mood = "选一种此刻的心情，让未来的你了解此刻的你";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [content, wishes, mood]);

  // Submit
  const handleSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const letter = saveLetter({
      recipientTime: recipient,
      content: content.trim(),
      wishes: wishes.filter((w) => w.trim().length > 0),
      mood,
    });

    // Clear draft after successful submit
    if (typeof window !== "undefined") {
      localStorage.removeItem(DRAFT_KEY);
    }

    setSealedId(letter.id);
  };

  const contentLength = content.trim().length;
  const isOverLimit = contentLength > 500;

  if (sealedId) {
    return <SealAnimation letterId={sealedId} letterPreview={content.trim().slice(0, 100)} />;
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-6">
      {/* Top info bar */}
      <div className="max-w-[720px] mx-auto text-center mb-6">
        <h1 className="font-serif font-bold text-amber text-xl md:text-2xl mb-2 flex items-center justify-center gap-2">
          <IconPen size={22} color="#d4a574" />
          写一封信给未来的自己
        </h1>
        <p className="font-sans text-warm-muted text-xs md:text-sm">
          把此刻的想法封存起来，让 AI 帮&quot;未来的你&quot;先回一封
        </p>
      </div>

      {/* Quick start templates */}
      <div className="max-w-[720px] mx-auto mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-sans text-warm-muted/60 text-xs">快速开始：</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {WRITE_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                setContent(tpl.content);
                setWishes([...tpl.wishes, "", ""]);
                handleMoodSelect(tpl.mood);
                setActiveTemplateId(tpl.id);
                textareaRef.current?.focus();
              }}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-sans transition-all duration-200 ${activeTemplateId === tpl.id ? 'bg-amber/15 border-amber/30 text-amber' : 'hover:bg-amber/10'}`}
              style={{
                backgroundColor: activeTemplateId === tpl.id ? "rgba(212,165,116,0.15)" : "rgba(35,30,25,0.5)",
                border: `1px solid ${activeTemplateId === tpl.id ? "rgba(212,165,116,0.3)" : "rgba(212,165,116,0.12)"}`,
                color: activeTemplateId === tpl.id ? "#d4a574" : "#a89888",
                cursor: "pointer",
              }}
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Letter Paper Card */}
      <div className="max-w-[720px] mx-auto relative">
        {/* Left binding line (desktop only) - gradient top to bottom */}
        <div
          className="absolute left-[60px] top-0 bottom-0 w-px pointer-events-none hidden md:block"
          style={{
            background: "linear-gradient(to bottom, rgba(200,100,100,0.28) 0%, rgba(200,100,100,0.06) 100%)",
          }}
        />

        <div
          className="relative bg-paper rounded-2xl p-4 md:p-10 letter-lines card-border-transition"
          style={{
            boxShadow: "0 8px 40px rgba(0,0,0,0.35), 0 2px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
            border: "1px solid rgba(212,165,116,0.08)",
          }}
        >
          {/* 1. Recipient & Time */}
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            {/* Recipient selector */}
            <div className="relative">
              <span className="font-handwrite text-[#2a2420] text-lg mr-2">收件人：</span>
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="font-handwrite text-[#2a2420] text-lg text-left relative inline-block min-w-[120px]"
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px dashed rgba(180,160,130,0.5)",
                  padding: "4px 8px 2px",
                  cursor: "pointer",
                }}
                aria-label="选择收件时间"
                aria-expanded={showDropdown}
              >
                {recipient}
                <span className="ml-1 text-[#8a7a6a] text-sm">▼</span>
              </button>

              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div
                    className="absolute top-full left-0 mt-1 z-50 rounded-lg overflow-hidden shadow-lg"
                    style={{
                      background: "#faf3e8",
                      border: "1px solid rgba(180,160,130,0.3)",
                      minWidth: "140px",
                    }}
                  >
                    {RECIPIENT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setRecipient(opt);
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2.5 font-handwrite text-[#2a2420] text-base hover:bg-[rgba(212,165,116,0.1)] transition-colors inline-flex items-center gap-2"
                        style={{ background: "transparent", border: "none", cursor: "pointer" }}
                        role="option"
                        aria-selected={recipient === opt}
                      >
                        <IconClock size={14} color="#a89888" />
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Postmark stamps */}
            <div className="flex flex-col items-end gap-1 ml-auto">
              <span
                className="inline-block px-3 py-1 rounded-full border-2 border-dashed border-[#c4a882]/50 text-[#8a7a6a] text-xs font-sans"
                style={{ transform: "rotate(-5deg)" }}
              >
                {formatDateCN(new Date())} 寄
              </span>
              <span
                className="inline-block px-3 py-1 rounded-full border-2 border-dashed border-amber/50 text-amber text-xs font-sans"
                style={{ transform: "rotate(-3deg)" }}
              >
                {demoMode ? "3 分钟后" : formatDateCN(openDate)} 开
              </span>
            </div>
          </div>

          {/* Demo mode toggle */}
          <div className="flex items-center justify-between mt-3 mb-1">
            <button
              type="button"
              onClick={() => {
                const next = !demoMode;
                setDemoModeLocal(next);
                setDemoMode(next);
              }}
              className="inline-flex items-center gap-2 text-xs font-sans text-amber/80 hover:text-amber transition-colors"
              role="switch"
              aria-checked={demoMode}
            >
              <span
                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                style={{ backgroundColor: demoMode ? "#d4a574" : "rgba(168,152,136,0.3)" }}
              >
                <span
                  className="inline-block h-3.5 w-3.5 transform rounded-full bg-paper transition-transform"
                  style={{ transform: demoMode ? "translateX(18px)" : "translateX(2px)" }}
                />
              </span>
              演示模式：3 分钟后开启
            </button>
            {demoMode && (
              <span className="text-[11px] text-amber/60 font-sans">
                新胶囊将在 3 分钟后可开启
              </span>
            )}
          </div>

          {/* 2. Salutation */}
          <div className="mb-4">
            <p className="font-handwrite text-[#2a2420] text-xl md:text-[1.3rem]">
              亲爱的 {salutation} 的我：
            </p>
          </div>

          {/* 3. Letter Content */}
          <div className="mb-8">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onFocus={() => setContentFocus(true)}
              onBlur={() => {
                setContentFocus(false);
                saveDraft({ recipient, content, wishes, mood });
              }}
              placeholder="此刻的你，想对未来的自己说些什么？可以聊聊近况、烦恼、期待..."
              className="w-full font-handwrite text-[#2a2420] text-base md:text-[1.15rem] resize-none bg-transparent outline-none"
              style={{
                lineHeight: "32px",
                minHeight: "200px",
                border: contentFocus
                  ? "1px dashed rgba(212,165,116,0.35)"
                  : "1px solid transparent",
                borderRadius: "8px",
                padding: "4px 0",
                caretColor: "#8a3a2a",
                boxShadow: contentFocus
                  ? "inset 0 0 0 1px rgba(212,165,116,0.08), inset 0 0 24px rgba(212,165,116,0.04)"
                  : "none",
                transition: "box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
              aria-label="信件正文"
            />
            {errors.content && (
              <p className="font-sans text-warm-muted text-xs mt-2" role="alert">
                {errors.content}
              </p>
            )}
            {/* Character count with progress bar */}
            <div className="mt-2 flex items-center gap-2 justify-end">
              <div className="w-24 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(168,152,136,0.15)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(contentLength / 500 * 100, 100)}%`,
                    backgroundColor: contentLength < 10 ? "#c46a4a" : contentLength > 450 ? "#d4a574" : "#d4a574",
                  }}
                />
              </div>
              <p
                className="font-sans text-[10px] flex items-center gap-1"
                style={{ color: contentLength < 10 && contentLength > 0 ? "#c46a4a" : isOverLimit ? "#d4a574" : "#a89888" }}
                aria-live="polite"
              >
                {contentLength < 10 && contentLength > 0 && (
                  <span className="inline-flex items-center gap-0.5">
                    <IconWarning size={10} color="#c46a4a" />
                    至少 10 字
                  </span>
                )}
                已写 {contentLength} 字
                {contentLength >= 10 && contentLength < 20 && "（可以提交了）"}
              </p>
            </div>
          </div>



          {/* 4. Wish List */}
          <div className="mb-6">
            <p className="font-handwrite text-[#2a2420] text-lg mb-3">我希望那时的你：</p>
            <div className="space-y-3">
              {wishes.map((wish, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="font-handwrite text-[#8a7a6a] text-base w-6 text-right shrink-0">
                    {i + 1}.
                  </span>
                  <input
                    type="text"
                    value={wish}
                    onChange={(e) => updateWish(i, e.target.value)}
                    onFocus={() => setFocusedWishIndex(i)}
                    onBlur={() => {
                      setFocusedWishIndex(null);
                      saveDraft({ recipient, content, wishes, mood });
                    }}
                    placeholder="写下一个愿望或目标..."
                    className="flex-1 font-handwrite text-[#2a2420] text-base bg-transparent outline-none"
                    style={{
                      border: "none",
                      borderBottom:
                        focusedWishIndex === i
                          ? "1px solid rgba(180,160,130,0.7)"
                          : "1px dashed rgba(180,160,130,0.4)",
                      padding: "4px 0",
                      lineHeight: "32px",
                      caretColor: "#8a3a2a",
                      transition: "border-bottom-color 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                    aria-label={`愿望 ${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeWish(i)}
                    className="text-[#c4a882]/40 hover:text-[#8a3a2a] transition-colors text-sm shrink-0 w-8 h-8 inline-flex items-center justify-center"
                    style={{ background: "transparent", border: "none", cursor: "pointer" }}
                    title="删除"
                    aria-label={`删除愿望 ${i + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {wishes.length < 6 && (
              <button
                type="button"
                onClick={addWish}
                className="mt-3 font-sans text-amber text-sm hover:underline transition-all btn-lift"
                style={{ background: "transparent", border: "none", cursor: "pointer" }}
              >
                + 添加一个愿望
              </button>
            )}
            {errors.wishes && (
              <p className="font-sans text-warm-muted text-xs mt-2" role="alert">
                {errors.wishes}
              </p>
            )}
          </div>

          {/* 5. Mood Selection */}
          <div className="mb-8">
            <p className="font-handwrite text-[#2a2420] text-lg mb-3">此刻的心情：</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="选择心情">
              {MOODS.map((m) => {
                const selected = mood === m.label;
                const Icon = m.icon;
                return (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => handleMoodSelect(m.label)}
                    className="px-4 py-2.5 md:py-2 rounded-full text-sm font-sans inline-flex items-center gap-1.5"
                    role="radio"
                    aria-checked={selected}
                    style={{
                      background: selected ? "#d4a574" : "transparent",
                      color: selected ? "#1a1512" : "#a89888",
                      border: selected ? "1px solid #d4a574" : "1px solid rgba(168,152,136,0.4)",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                      animation:
                        selected && moodAnimKey?.startsWith(m.label)
                          ? "mood-bounce 0.4s cubic-bezier(0.22, 1, 0.36, 1)"
                          : "none",
                    }}
                  >
                    <Icon size={14} color={selected ? "#1a1512" : "#a89888"} />
                    {m.label}
                  </button>
                );
              })}
            </div>
            {errors.mood && (
              <p className="font-sans text-warm-muted text-xs mt-2" role="alert">
                {errors.mood}
              </p>
            )}
          </div>

          {/* 6. Signature */}
          <div className="text-right">
            <p className="font-handwrite text-[#2a2420] text-lg">
              {getMonthYearCN(new Date())}的我
            </p>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="max-w-[720px] mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mt-8 mb-4 px-1">
          {[
            { done: true, label: "收件人" },
            { done: content.trim().length >= 10, label: "信件内容" },
            { done: mood !== "", label: "选择心情" },
          ].map((step, i) => (
            <React.Fragment key={step.label}>
              {i > 0 && (
                <div
                  className="flex-1 h-px"
                  style={{
                    backgroundColor: step.done ? "rgba(212,165,116,0.4)" : "rgba(168,152,136,0.15)",
                    transition: "background-color 0.3s ease",
                  }}
                />
              )}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: step.done ? "#d4a574" : "rgba(168,152,136,0.3)",
                    boxShadow: step.done ? "0 0 6px rgba(212,165,116,0.3)" : "none",
                  }}
                />
                <span
                  className="font-sans text-[10px] md:text-xs transition-colors duration-300"
                  style={{ color: step.done ? "#d4a574" : "rgba(168,152,136,0.5)" }}
                >
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="max-w-[720px] mx-auto mt-8 text-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-block w-full max-w-[320px] px-8 py-4 bg-amber text-bg-deep font-sans font-semibold text-sm rounded-xl btn-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          style={{
            boxShadow: "0 0 0 rgba(212,165,116,0)",
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(212,165,116,0.3)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 0 0 rgba(212,165,116,0)";
          }}
          aria-label="封存信件"
        >
          {isSubmitting ? (
            "正在封存..."
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              封存信件，等待回信
              <IconEnvelope size={16} color="#1a1512" />
            </span>
          )}
        </button>
        <p className="font-sans text-warm-muted text-xs mt-3">
          信件将被封存，AI 将以&quot;未来的你&quot;的身份回信
        </p>
      </div>
    </div>
  );
}
