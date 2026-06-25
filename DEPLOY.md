# 时间胶囊 — Vercel 部署指南

## 1. 推送代码到 GitHub

```bash
git init
git add .
git commit -m "feat: 时间胶囊完整项目"
git remote add origin <your-repo-url>
git push -u origin main
```

## 2. Vercel 部署

1. 登录 [vercel.com](https://vercel.com)
2. 点击 "Add New Project" → "Import Git Repository"
3. 选择刚推送的仓库
4. Framework Preset 选择 **Next.js**
5. 在 **Environment Variables** 中添加：
   - `DEEPSEEK_API_KEY` = `your-actual-key`
   - `DEEPSEEK_BASE_URL` = `https://api.deepseek.com`
6. 点击 **Deploy**

## 3. 验证部署

部署完成后，访问项目 URL：
- 首页 `/` — 应该正常显示
- 写信页 `/write` — 表单交互正常
- API 路由 `/api/reply` — POST 请求返回流式响应

## 4. 自定义域名（可选）

在 Vercel 项目 Settings → Domains 中添加自定义域名，按提示配置 DNS。

## 注意事项

- `.env.local` 已加入 `.gitignore`，不会提交到 Git
- 环境变量必须在 Vercel 控制台中单独配置
- API Key 请使用真实的 DeepSeek API Key
- 免费额度用完后需要充值或更换 Key
