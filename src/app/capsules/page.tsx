"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLetters, type TimeCapsuleLetter, formatDateCN, isLetterOpenable } from "@/lib/storage";
import {
  IconCalendar,
  IconClock,
  IconCheck,
  IconPen,
  IconMailbox,
} from "@/components/Icons";
import { Countdown } from "@/components/Countdown";

function getDaysUntilOpen(openAt: string): number {
  const diff = new Date(openAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getNodeColor(status: TimeCapsuleLetter["status"]): string {
  if (status === "opened") return "#a89888";
  return "#d4a574";
}

type FilterTab = "all" | "waiting" | "opened";

const FILTER_OPTIONS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "waiting", label: "等待中" },
  { key: "opened", label: "已开启" },
];

function EmptyEnvelopeIcon() {
  return (
    <div className="relative mx-auto mb-6" style={{ width: 72, height: 52 }}>
      <svg
        width="72"
        height="52"
        viewBox="0 0 72 52"
        fill="none"
        className="text-amber/40"
      >
        <rect
          x="2"
          y="2"
          width="68"
          height="48"
          rx="4"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M2 6L36 28L70 6"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M2 18L36 40L70 18"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 3"
          fill="none"
          opacity="0.5"
        />
      </svg>
      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
        style={{ background: "rgba(212,165,116,0.15)", filter: "blur(2px)" }}
      />
    </div>
  );
}

function CapsuleCard({
  letter,
  index,
}: {
  letter: TimeCapsuleLetter;
  index: number;
}) {
  const summary =
    letter.content.slice(0, 30) + (letter.content.length > 30 ? "..." : "");
  const visibleWishes = letter.wishes.slice(0, 2);
  const hiddenWishes = letter.wishes.length - 2;
  const isEven = index % 2 === 1;
  const openable = isLetterOpenable(letter);

  const statusLabel =
    letter.status === "opened"
      ? "已开启"
      : openable
      ? "时间已到"
      : "封印中";

  return (
    <div
      className={`relative flex items-start md:items-center flex-row ${
        isEven ? "md:flex-row-reverse" : "md:flex-row"
      } md:justify-center`}
      style={{
        animation: "stagger-fade-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        animationDelay: `${Math.min(index * 100, 600)}ms`,
        opacity: 0,
      }}
    >
      {/* Timeline node - mobile left, desktop center */}
      <div className="absolute left-[14px] md:left-1/2 md:-translate-x-1/2 z-10">
        <div
          className="w-3 h-3 rounded-full"
          style={{
            backgroundColor: getNodeColor(letter.status),
            boxShadow:
              letter.status === "sealed"
                ? "0 0 12px rgba(212,165,116,0.5), 0 0 24px rgba(212,165,116,0.2)"
                : "none",
            animation:
              letter.status === "sealed"
                ? "seal-pulse 3s ease-in-out infinite"
                : "none",
          }}
        />
      </div>

      {/* Content card - mobile right, desktop half width */}
      <div className="ml-10 md:ml-0 w-[calc(100%-2.5rem)] md:w-[calc(50%-2rem)]">
        <Link href={`/capsules/${letter.id}`} className="block">
          <div
            className="rounded-xl p-5 md:p-6 card-border-transition active:scale-[0.98]"
            style={{
              backgroundColor: "rgba(35,30,25,0.6)",
              border: "1px solid rgba(212,165,116,0.12)",
              transformOrigin: "center center",
              transitionDuration: "0.25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(212,165,116,0.35)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(212,165,116,0.12)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="inline-block px-2.5 py-1 rounded-full text-xs font-sans"
                style={{
                  backgroundColor: "rgba(212,165,116,0.15)",
                  color: "#d4a574",
                }}
              >
                <IconCalendar size={14} className="mr-1" />
                {letter.recipientTime}期胶囊
              </span>
              <span className="text-sm">{letter.mood}</span>
            </div>

            {/* Summary */}
            <p className="font-serif text-warm-white text-sm md:text-base mb-3 leading-relaxed">
              {summary}
            </p>

            {/* Wishes preview */}
            {visibleWishes.length > 0 && (
              <div className="mb-3 space-y-1">
                {visibleWishes.map((w, i) => (
                  <p
                    key={i}
                    className="font-sans text-warm-muted text-xs truncate"
                  >
                    {i + 1}. {w}
                  </p>
                ))}
                {hiddenWishes > 0 && (
                  <p className="font-sans text-warm-muted/60 text-xs">
                    还有 {hiddenWishes} 条愿望...
                  </p>
                )}
              </div>
            )}

            {/* Bottom row */}
            <div className="flex items-center justify-between">
              <span className="font-sans text-warm-muted/60 text-xs">
                写于 {formatDateCN(new Date(letter.createdAt))}
              </span>
              {letter.status === "opened" ? (
                <span className="font-sans text-xs text-warm-muted/60">{statusLabel}</span>
              ) : openable ? (
                <span className="font-sans text-xs text-amber">{statusLabel}</span>
              ) : (
                <Countdown targetDate={letter.openAt} size="sm" showSeconds={false} />
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Spacer for alternating - desktop only */}
      <div className="hidden md:block md:w-[calc(50%-2rem)]" />
    </div>
  );
}

export default function CapsulesPage() {
  const [letters, setLetters] = useState<TimeCapsuleLetter[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("all");

  useEffect(() => {
    setMounted(true);
    setLetters(getLetters());
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div
            className="mb-3 inline-block"
            style={{ animation: "loading-pulse 1.5s ease-in-out infinite" }}
          >
            <IconClock size={32} />
          </div>
          <p className="text-warm-muted font-sans text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  const total = letters.length;
  const unopened = letters.filter((l) => l.status !== "opened").length;

  const filteredLetters = letters.filter((l) => {
    if (filter === "waiting") return l.status !== "opened";
    if (filter === "opened") return l.status === "opened";
    return true;
  });

  // Empty state
  if (total === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20" style={{ animation: "fade-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}>
        <div className="text-center">
          <svg width="80" height="60" viewBox="0 0 80 60" fill="none" className="text-amber/30 mx-auto">
            <rect x="3" y="3" width="74" height="54" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M3 8L40 32L77 8" stroke="currentColor" strokeWidth="2" stroke-linejoin="round" fill="none"/>
            <path d="M25 30L40 38L55 30" stroke="currentColor" strokeWidth="1.5" stroke-dasharray="4 3" fill="none" opacity="0.6"/>
          </svg>
          <h1 className="font-serif font-bold text-amber text-xl mt-6 mb-3">
            还没有时间胶囊
          </h1>
          <p className="font-sans text-warm-muted text-sm mb-8 max-w-xs mx-auto leading-relaxed">
            写一封信给未来的自己，封存此刻的心情与愿望
          </p>
          <Link
            href="/write"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber text-[#1a1512] font-sans text-sm font-medium hover:bg-amber/90 transition-all btn-lift"
          >
            写第一封信
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-28 px-4 md:px-6">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif font-bold text-amber text-2xl md:text-3xl mb-2 inline-flex items-center gap-2 justify-center">
            <IconMailbox size={28} />
            我的时间胶囊
          </h1>
          <p className="font-handwrite text-warm-muted text-base md:text-lg mb-3">
            每一封信都是一颗种子，等待时间让它生长
          </p>
          <p className="font-sans text-warm-muted/60 text-xs mb-6">
            共 {total} 封信 · {unopened} 封待开启
          </p>

          {/* Filter tabs */}
          <div
            className="inline-flex items-center rounded-full p-1"
            style={{
              backgroundColor: "rgba(35,30,25,0.6)",
              border: "1px solid rgba(212,165,116,0.12)",
            }}
            role="tablist"
            aria-label="筛选胶囊"
          >
            {FILTER_OPTIONS.map((opt) => {
              const active = filter === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(opt.key)}
                  className="px-4 py-2.5 md:py-1.5 rounded-full text-xs font-sans transition-all duration-200"
                  style={{
                    backgroundColor: active
                      ? "rgba(212,165,116,0.2)"
                      : "transparent",
                    color: active ? "#d4a574" : "#a89888",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Items */}
          <div className="space-y-8 md:space-y-10">
            {filteredLetters.map((letter, i) => (
              <CapsuleCard key={letter.id} letter={letter} index={i} />
            ))}
          </div>

          {/* Empty filtered state */}
          {filteredLetters.length === 0 && (
            <div className="text-center py-16">
              <p className="font-sans text-warm-muted/60 text-sm">
                该分类下暂无胶囊
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating FAB */}
      <Link
        href="/write"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-amber flex items-center justify-center text-bg-deep z-40 transition-all duration-300 hover:scale-105 btn-lift"
        style={{
          boxShadow:
            "0 4px 20px rgba(212,165,116,0.3), 0 0 40px rgba(212,165,116,0.1)",
        }}
        aria-label="写一封信"
      >
        <IconPen size={24} />
      </Link>
    </div>
  );
}
