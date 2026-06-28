# 未来开启机制实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Inline execution in this session.

**Goal:** 实现胶囊的「未来开启」机制：未到 `openAt` 无法查看内容，提供本地演示模式，并在列表/详情页展示封印状态与倒计时。

**Architecture:** 在 `storage.ts` 中增加演示模式持久化、开启判断与 `openLetter` 方法；写信页根据演示模式计算 `openAt`；列表与详情页根据 `openAt` 与 `status` 控制内容可见性，并新增倒计时组件。

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, localStorage.

---

## 文件变更清单

| 文件 | 职责 |
|---|---|
| `src/lib/storage.ts` | 新增演示模式读写、`isLetterOpenable`、`openLetter`、修改 `calculateOpenDate` |
| `src/components/Countdown.tsx` | 新建通用倒计时组件 |
| `src/app/write/page.tsx` | 增加演示模式开关与提示 |
| `src/app/capsules/page.tsx` | 胶囊卡片显示状态标签与倒计时 |
| `src/app/capsules/[id]/page.tsx` | 详情页封印/可开启/已开启三种状态 UI |

---

## Task 1: Storage 层扩展

**Files:**
- Modify: `src/lib/storage.ts`

新增/修改内容：

```ts
const DEMO_MODE_KEY = "time-capsule-demo-mode";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_MODE_KEY) === "true";
}

export function setDemoMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_MODE_KEY, String(enabled));
}

export function calculateOpenDate(recipientTime: RecipientTime, demoMode = false): Date {
  const now = new Date();
  if (demoMode) {
    const result = new Date(now);
    result.setMinutes(result.getMinutes() + 3);
    return result;
  }
  const result = new Date(now);
  switch (recipientTime) {
    case "6个月后": result.setMonth(result.getMonth() + 6); break;
    case "1年后": result.setFullYear(result.getFullYear() + 1); break;
    case "3年后": result.setFullYear(result.getFullYear() + 3); break;
    case "5年后": result.setFullYear(result.getFullYear() + 5); break;
  }
  return result;
}

export function isLetterOpenable(letter: TimeCapsuleLetter): boolean {
  if (letter.status === "opened") return false;
  const openAt = letter.openAt ? new Date(letter.openAt) : new Date(0);
  return new Date() >= openAt;
}

export function openLetter(id: string): void {
  const letters = getLetters();
  const index = letters.findIndex((l) => l.id === id);
  if (index !== -1) {
    letters[index].status = "opened";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
    notifyStorageChange();
  }
}
```

同时修改 `saveLetter` 中调用 `calculateOpenDate` 的地方：
```ts
openAt: calculateOpenDate(letter.recipientTime, isDemoMode()).toISOString(),
```

---

## Task 2: 倒计时组件

**Files:**
- Create: `src/components/Countdown.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string;
  size?: "sm" | "md" | "lg";
  showSeconds?: boolean;
}

export function Countdown({ targetDate, size = "md", showSeconds = true }: CountdownProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return null;

  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return (
      <div className="font-sans text-amber text-sm">
        时间已到
      </div>
    );
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const boxClass = {
    sm: "w-10 h-10 text-xs",
    md: "w-12 h-14 md:w-16 md:h-20 text-sm md:text-base",
    lg: "w-14 h-16 md:w-20 md:h-24 text-base md:text-xl",
  }[size];

  const parts = showSeconds
    ? [
        { value: days, label: "天" },
        { value: hours, label: "时" },
        { value: minutes, label: "分" },
        { value: seconds, label: "秒" },
      ]
    : [
        { value: days, label: "天" },
        { value: hours, label: "时" },
        { value: minutes, label: "分" },
      ];

  return (
    <div className="flex items-center justify-center gap-1.5 md:gap-2 font-sans">
      {parts.map((part, i) => (
        <div key={part.label} className="flex items-center gap-1.5 md:gap-2">
          <div
            className={`${boxClass} flex flex-col items-center justify-center rounded-lg bg-amber/10 text-amber border border-amber/20`}
          >
            <span className="font-semibold tabular-nums">
              {String(part.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] md:text-xs opacity-70">{part.label}</span>
          </div>
          {i < parts.length - 1 && (
            <span className="text-amber/60 font-semibold">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Task 3: 写信页演示模式开关

**Files:**
- Modify: `src/app/write/page.tsx`

在「收件人时间」选择器附近增加开关：

```tsx
import { isDemoMode, setDemoMode } from "@/lib/storage";
import { IconClockFast } from "@/components/Icons"; // 若不存在则用 IconClock
```

新增 state：
```tsx
const [demoMode, setDemoModeLocal] = useState(false);

useEffect(() => {
  setDemoModeLocal(isDemoMode());
}, []);
```

在收件人选择器下方插入：
```tsx
<div className="flex items-center justify-between mt-4">
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
```

---

## Task 4: 列表页状态标签

**Files:**
- Modify: `src/app/capsules/page.tsx`

引入：
```tsx
import { isLetterOpenable } from "@/lib/storage";
import { Countdown } from "@/components/Countdown";
```

在 `CapsuleCard` 中替换状态标签逻辑。将原来的 `statusLabel` 改为基于 `isLetterOpenable(letter)` 计算：

```tsx
const openable = isLetterOpenable(letter);
const statusLabel = letter.status === "opened"
  ? "已阅"
  : openable
  ? "时间已到"
  : "封印中";
```

在卡片底部区域，把纯文本状态改为：
```tsx
<div className="flex items-center justify-between">
  <span className="font-sans text-warm-muted/60 text-xs">
    写于 {formatDateCN(new Date(letter.createdAt))}
  </span>
  {letter.status === "opened" ? (
    <span className="font-sans text-xs text-warm-muted/60">已阅</span>
  ) : openable ? (
    <span className="font-sans text-xs text-amber">时间已到</span>
  ) : (
    <Countdown targetDate={letter.openAt} size="sm" showSeconds={false} />
  )}
</div>
```

---

## Task 5: 详情页封印/开启/已开启状态

**Files:**
- Modify: `src/app/capsules/[id]/page.tsx`

引入：
```tsx
import { isLetterOpenable, openLetter } from "@/lib/storage";
```

在组件内增加：
```tsx
const [opened, setOpened] = useState(letter.status === "opened");
const openable = isLetterOpenable(letter);

const handleOpen = () => {
  openLetter(letter.id);
  setOpened(true);
};
```

把顶部状态标签改为：
```tsx
{opened ? (
  <>
    <IconCheck size={12} />
    已开启
  </>
) : openable ? (
  <>
    <IconClock size={12} />
    可开启
  </>
) : (
  <>
    <IconClock size={12} />
    封印中
  </>
)}
```

倒计时区域在 `opened` 为 false 时显示：
```tsx
{!opened && (
  <div className="mb-8 text-center">
    <Countdown targetDate={letter.openAt} size="lg" />
    <p className="mt-3 font-sans text-warm-muted text-xs">
      这封信将在 {new Date(letter.openAt).toLocaleString("zh-CN")} 开启
    </p>
    {openable && (
      <button
        onClick={handleOpen}
        className="mt-6 px-6 py-2.5 rounded-full bg-amber text-[#1a1512] font-sans text-sm font-medium hover:bg-amber/90 transition-all"
        style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
      >
        开启胶囊
      </button>
    )}
  </div>
)}
```

原信与 AI 回信只在 `opened` 为 true 时渲染：
```tsx
{opened && (
  <>
    {/* Original Letter */}
    ...
    {/* AI Reply */}
    ...
  </>
)}
```

---

## Task 6: 全局动画

**Files:**
- Modify: `src/app/globals.css`

增加脉冲光晕动画：
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(212, 165, 116, 0); }
}
```

---

## Task 7: 构建与提交

**Files:**
- All modified files

Run:
```bash
cd /workspace/time-capsule && npm run build
```

Expected: Build succeeds, no TypeScript errors.

Commit:
```bash
git add -A
git commit -m "feat: future open mechanism with demo mode and countdown"
git push origin master
```

---

## Self-Review

- **Spec coverage:** 演示模式 ✓、开启判断 ✓、倒计时 ✓、列表状态 ✓、详情封印/开启 ✓、动画 ✓。
- **Placeholder scan:** 无 TBD/TODO。
- **Type consistency:** `calculateOpenDate` 签名统一，状态判断函数一致使用 `TimeCapsuleLetter`。
