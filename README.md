# 时间胶囊

> 给未来的自己写一封信，AI 帮"未来的你"提前回信。

## 项目简介

「时间胶囊」是一个基于 Next.js 16 + AI 的情感记录与互动 Web 应用。用户可以写信给未来的自己，选择封存时间（6个月 / 1年 / 3年 / 5年），AI 会立即扮演"未来的你"写一封温暖真诚的回信。

本项目为 TRAE AI 创造力大赛参赛作品。

## 技术栈

- **框架**: Next.js 16 (App Router + Turbopack)
- **语言**: TypeScript (Strict Mode)
- **样式**: Tailwind CSS v4
- **字体**: next/font/google (Long Cang, Noto Serif SC, Inter)
- **AI 模型**: DeepSeek (OpenAI SDK 兼容流式 API)
- **数据存储**: localStorage（客户端持久化）

## 功能特性

- ✍️ **写信封存** — 写信给未来的自己，选择封存时长，仪式感十足的信封封存动画
- 🤖 **AI 回信** — DeepSeek 扮演"未来的你"生成温暖真诚的回信，支持流式打字机效果
- 📬 **胶囊管理** — 时间轴展示所有信件，支持筛选（全部 / 等待中 / 已开启）
- ⏳ **倒计时** — 胶囊详情页实时显示距离开启的倒计时
- 🎨 **沉浸式设计** — 暖色调信纸纹理、手写字体、三层阴影卡片、邮戳印章细节
- 📱 **响应式** — 完美适配桌面端与移动端 375px 宽度
- ♿ **无障碍** — aria-label、role 标注、prefers-reduced-motion 支持

## 本地开发

```bash
# 安装依赖
npm install

# 配置 AI API Key
cp .env.local.example .env.local
# 编辑 .env.local，填入 DEEPSEEK_API_KEY

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 部署

支持一键部署到 Vercel。详见 [DEPLOY.md](./DEPLOY.md)。

## 项目结构

```
src/
  app/              # Next.js App Router 页面
    page.tsx        # 首页
    write/page.tsx  # 写信页
    reply/page.tsx  # AI 回信页
    capsules/       # 胶囊管理（列表 + 详情）
    api/reply/      # AI 回信 API 路由
  components/       # React 组件
  lib/storage.ts    # localStorage 数据层
public/             # 静态资源
```

## License

MIT
