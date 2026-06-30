"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getLetterById,
  deleteLetter,
  formatDateCN,
  getSalutation,
  isLetterOpenable,
  openLetter,
  type TimeCapsuleLetter,
} from "@/lib/storage";
import {
  IconClock,
  IconTrash,
  IconPen,
  IconMailbox,
  IconEnvelope,
  IconCheck,
  IconRobot,
  IconInbox,
} from "@/components/Icons";
import { Countdown } from "@/components/Countdown";
import { useToast } from "@/components/Toast";
import { ShareCard } from "@/components/ShareCard";

function DeleteModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(26,21,18,0.85)" }}
      role="dialog"
      aria-modal="true"
      aria-label="删除确认"
    >
      <div
        className="rounded-2xl p-6 md:p-8 max-w-sm w-full text-center"
        style={{ backgroundColor: "#231e19", border: "1px solid rgba(212,165,116,0.2)" }}
      >
        <div className="mb-4 inline-block">
          <IconTrash size={40} color="#d4a574" />
        </div>
        <h3 className="font-serif font-bold text-warm-white text-lg mb-2">
          确定删除这封时间胶囊吗？
        </h3>
        <p className="font-sans text-warm-muted text-sm mb-6">
          删除后无法恢复
        </p>
        <div className="flex items-center gap-3 justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-amber/40 text-amber font-sans text-sm rounded-full hover:bg-amber/10 transition-all btn-lift"
            style={{ background: "transparent", cursor: "pointer" }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 bg-seal-red text-paper font-sans text-sm rounded-full hover:opacity-90 transition-all btn-lift"
            style={{ cursor: "pointer" }}
          >
            确定删除
          </button>
        </div>
      </div>
    </div>
  );
}

function CapsuleDetail() {
  const params = useParams();
  const router = useRouter();
  const letterId = params.id as string;
  const toast = useToast();

  const [letter, setLetter] = useState<TimeCapsuleLetter | null>(null);
  const [opened, setOpened] = useState(false);
  const [viewMode, setViewMode] = useState<"stacked" | "compare">("stacked");
  const [opening, setOpening] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    setMounted(true);
    const found = getLetterById(letterId);
    if (found) {
      // Check reply progress cache for AI reply data that hasn't been saved to letter yet
      if (!found.aiReply) {
        try {
          const progressKey = `tc-reply-progress-${letterId}`;
          const cached = localStorage.getItem(progressKey);
          if (cached && cached.trim().length > 0) {
            found.aiReply = cached;
          }
        } catch {
          // ignore errors
        }
      }
      // Auto-open capsules created before future-open feature (status is replied but not opened)
      if (found.status === "replied") {
        found.status = "opened";
      }
      setOpened(found.status === "opened");
      setLetter(found);
    } else {
      setLetter(null);
    }
  }, [letterId]);

  const handleDelete = useCallback(() => {
    deleteLetter(letterId);
    toast.info("胶囊已删除");
    router.push("/capsules");
  }, [letterId, router, toast]);

  const handleOpen = useCallback(() => {
    openLetter(letterId);
    setOpened(true);
    toast.success("胶囊已开启，时光信件解封成功");
  }, [letterId, toast]);

  useEffect(() => {
    if (!opening) return;
    openLetter(letterId);
    const timer = setTimeout(() => {
      setOpened(true);
      setOpening(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [opening, letterId]);

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

  if (!letter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <div className="text-center">
          <div className="mb-6 inline-block">
            <IconInbox size={48} />
          </div>
          <h1 className="font-serif font-bold text-amber text-2xl mb-4">
            找不到这封信
          </h1>
          <p className="font-sans text-warm-muted text-sm mb-8">
            这封信可能已被删除或链接有误
          </p>
          <Link
            href="/capsules"
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-amber/40 text-amber font-sans text-sm rounded-full hover:bg-amber/10 transition-all btn-lift"
          >
            回到我的胶囊
          </Link>
        </div>
      </div>
    );
  }

  const salutation = getSalutation(letter.recipientTime);
  const openDate = new Date(letter.openAt);
  const createDate = new Date(letter.createdAt);
  const openable = isLetterOpenable(letter);
  const showReply = !!letter.aiReply;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-6">
      <div className="max-w-[720px] mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/capsules"
            className="font-sans text-amber text-sm hover:underline transition-all"
          >
            ← 回到我的胶囊
          </Link>
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-sans"
            style={{
              backgroundColor:
                letter.status === "opened"
                  ? "rgba(168,152,136,0.15)"
                  : "rgba(212,165,116,0.15)",
              color:
                letter.status === "opened" ? "#a89888" : "#d4a574",
            }}
          >
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
          </span>
        </div>

        {/* Countdown / Open action */}
        {!opened && !opening && (
          <div className="mb-8 text-center">
            <Countdown targetDate={letter.openAt} size="lg" />
            <p className="mt-3 font-sans text-warm-muted text-xs">
              这封信将在 {openDate.toLocaleString("zh-CN")} 开启
            </p>
            {openable && (
              <button
                onClick={handleOpen}
                disabled={opening}
                className="mt-6 px-6 py-2.5 rounded-full bg-amber text-[#1a1512] font-sans text-sm font-medium hover:bg-amber/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
              >
                开启胶囊
              </button>
            )}
          </div>
        )}

        {/* Sealed state - letter preview hint */}
        {!opened && !opening && (
          <div className="text-center mb-8 fade-in">
            <div className="inline-block p-6 rounded-2xl" style={{ backgroundColor: "rgba(35,30,25,0.4)", border: "1px solid rgba(212,165,116,0.08)" }}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber/60" style={{ animation: "pulse-glow 2s ease-in-out infinite" }} />
                <span className="font-sans text-warm-muted/50 text-xs">信件已安全封存</span>
                <div className="w-2 h-2 rounded-full bg-amber/60" style={{ animation: "pulse-glow 2s ease-in-out infinite" }} />
              </div>
              <p className="font-handwrite text-warm-muted/40 text-sm mb-2 line-clamp-2 max-w-[400px]">
                {letter.content.slice(0, 60)}...
              </p>
              <p className="font-sans text-warm-muted/30 text-[10px]">
                内容预览 · 开启后查看完整信件
              </p>
            </div>
          </div>
        )}

        {/* Opening animation overlay */}
        {opening && (
          <div className="mb-8 text-center" style={{ animation: "open-capsule-reveal 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}>
            <div className="inline-block relative mx-auto" style={{ width: 80, height: 60 }}>
              <svg width="80" height="60" viewBox="0 0 80 60" fill="none" className="text-amber">
                <rect x="3" y="3" width="74" height="54" rx="4" stroke="currentColor" strokeWidth="2" fill="none" className="animate-pulse" style={{ animationDuration: "2s" }}/>
                <path d="M3 8L40 32L77 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/>
                <path d="M20 20L40 35L60 20" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" strokeDasharray="4 3"/>
              </svg>
            </div>
            <p className="mt-4 font-handwrite text-amber text-lg">时光信件正在解封...</p>
          </div>
        )}

        {/* Original Letter - stacked mode */}
        {opened && !opening && viewMode === "stacked" && (
        <div className="mb-4" style={{ animation: "unfold-letter 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}>
          <div
            className="relative bg-paper rounded-2xl p-4 md:p-10 letter-lines card-border-transition"
            style={{
              boxShadow: "0 4px 24px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2)",
              border: "1px solid rgba(212,165,116,0.08)",
            }}
            role="article"
            aria-label="原信内容"
          >
            <div className="flex items-start justify-between mb-6 flex-wrap gap-2">
              <span className="font-sans text-sm text-[#6a5a4a] inline-flex items-center gap-1">
                <IconMailbox size={14} />
                {formatDateCN(createDate)} 的我 · {letter.mood}
              </span>
              <span
                className="inline-block px-3 py-1 rounded-full border-2 border-dashed border-[#c4a882]/50 text-[#8a7a6a] text-xs font-sans"
                style={{ transform: "rotate(-5deg)" }}
              >
                {formatDateCN(createDate)} 寄
              </span>
            </div>
            <div className="markdown-body font-handwrite text-[#2a2420] text-base md:text-lg leading-[32px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {letter.content || ""}
              </ReactMarkdown>
            </div>
            {letter.wishes.length > 0 && (
              <div className="mt-4">
                <p className="font-handwrite text-[#2a2420] text-base mb-2">
                  我希望那时的你：
                </p>
                {letter.wishes.map((w, i) => (
                  <p key={i} className="font-handwrite text-[#2a2420] text-base ml-4">
                    {i + 1}. {w}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        {/* View mode toggle - only when both original and AI reply exist */}
        {opened && !opening && showReply && (
          <div className="flex items-center justify-center gap-1 mb-6 mt-2">
            <button
              type="button"
              onClick={() => setViewMode("stacked")}
              className={`px-3 py-1.5 rounded-full text-[11px] font-sans transition-all`}
              style={{
                backgroundColor: viewMode === "stacked" ? "rgba(212,165,116,0.15)" : "transparent",
                color: viewMode === "stacked" ? "#d4a574" : "#a89888",
                border: viewMode === "stacked" ? "1px solid rgba(212,165,116,0.3)" : "1px solid rgba(212,165,116,0.08)",
                cursor: "pointer",
              }}
            >
              顺序阅读
            </button>
            <button
              type="button"
              onClick={() => setViewMode("compare")}
              className={`px-3 py-1.5 rounded-full text-[11px] font-sans transition-all`}
              style={{
                backgroundColor: viewMode === "compare" ? "rgba(212,165,116,0.15)" : "transparent",
                color: viewMode === "compare" ? "#d4a574" : "#a89888",
                border: viewMode === "compare" ? "1px solid rgba(212,165,116,0.3)" : "1px solid rgba(212,165,116,0.08)",
                cursor: "pointer",
              }}
            >
              时光对比
            </button>
          </div>
        )}

        {/* AI Reply - stacked mode */}
        {opened && !opening && showReply && viewMode === "stacked" && (
          <div className="mb-8" style={{ animation: "unfold-letter 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both" }}>
            <div
              className="relative bg-paper-alt rounded-2xl p-4 md:p-10 letter-lines card-border-transition"
              style={{
                boxShadow: "0 4px 24px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2)",
                border: "1px solid rgba(212,165,116,0.08)",
              }}
              role="article"
              aria-label="AI 回信内容"
            >
              <div className="flex items-start justify-between mb-6 flex-wrap gap-2">
                <span className="font-sans text-sm text-[#6a5a4a] inline-flex items-center gap-1">
                  <IconEnvelope size={14} />
                  {salutation}的你
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber/15 text-amber text-[11px] font-sans font-medium"
                    style={{ letterSpacing: "0.02em" }}
                  >
                    <IconRobot size={12} />
                    AI 生成
                  </span>
                  <span
                    className="inline-block px-3 py-1 rounded-full border-2 border-dashed border-amber/50 text-amber text-xs font-sans"
                    style={{ transform: "rotate(-5deg)" }}
                  >
                    {formatDateCN(openDate)}
                  </span>
                </div>
              </div>
              <div className="markdown-body font-handwrite text-[#2a2420] text-base md:text-lg leading-[32px]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {letter.aiReply || ""}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Compare mode - side by side */}
        {opened && !opening && showReply && viewMode === "compare" && (
          <div className="mb-8" style={{ animation: "unfold-letter 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative">
              {/* Time bridge indicator */}
              <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-px" style={{ background: "rgba(212,165,116,0.3)" }} />
                  <div className="px-2 py-1 rounded-full text-[9px] font-sans text-amber bg-bg-deep/80" style={{ border: "1px solid rgba(212,165,116,0.2)" }}>
                    {Math.floor((openDate.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24))} 天
                  </div>
                  <div className="w-8 h-px" style={{ background: "rgba(212,165,116,0.3)" }} />
                </div>
              </div>
              {/* Original letter card */}
              <div className="relative bg-paper rounded-2xl p-4 md:p-6 letter-lines" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)", border: "1px solid rgba(212,165,116,0.08)" }}>
                <div className="flex items-center gap-1 mb-3">
                  <IconMailbox size={12} />
                  <span className="font-sans text-[#6a5a4a] text-xs">{formatDateCN(createDate)} 的我</span>
                </div>
                <div className="markdown-body font-handwrite text-[#2a2420] text-sm md:text-base leading-[28px] md:leading-[30px] max-h-[400px] overflow-y-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{letter.content || ""}</ReactMarkdown>
                </div>
                {letter.wishes.length > 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px dashed rgba(200,100,100,0.2)" }}>
                    <p className="font-handwrite text-[#2a2420] text-sm mb-1">我希望那时的你：</p>
                    {letter.wishes.map((w, i) => (
                      <p key={i} className="font-handwrite text-[#2a2420] text-sm ml-3">{i + 1}. {w}</p>
                    ))}
                  </div>
                )}
              </div>
              {/* AI Reply card */}
              <div className="relative bg-paper-alt rounded-2xl p-4 md:p-6 letter-lines" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)", border: "1px solid rgba(212,165,116,0.08)" }}>
                <div className="flex items-center gap-1 mb-3">
                  <IconRobot size={12} />
                  <span className="font-sans text-[#6a5a4a] text-xs">{salutation}后的你 · AI 生成</span>
                </div>
                <div className="markdown-body font-handwrite text-[#2a2420] text-sm md:text-base leading-[28px] md:leading-[30px] max-h-[400px] overflow-y-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{letter.aiReply || ""}</ReactMarkdown>
                </div>
              </div>
            </div>
            {/* Mobile time bridge */}
            <div className="flex md:hidden items-center justify-center gap-2 my-3">
              <div className="flex-1 h-px" style={{ background: "rgba(212,165,116,0.2)" }} />
              <span className="font-sans text-amber/60 text-[10px]">
                跨越 {Math.floor((openDate.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24))} 天
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(212,165,116,0.2)" }} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mt-8">
          <Link
            href="/write"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-6 py-2.5 border border-amber/40 text-amber font-sans text-sm rounded-full hover:bg-amber/10 transition-all text-center btn-lift"
          >
            <IconPen size={14} />
            再写一封
          </Link>
          <ShareCard
            recipientTime={letter.recipientTime}
            createdAt={formatDateCN(createDate)}
            openAt={formatDateCN(openDate)}
            mood={letter.mood}
            contentPreview={letter.content}
          />
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-6 py-2.5 border border-warm-muted/30 text-warm-muted font-sans text-sm rounded-full hover:border-seal-red hover:text-seal-red transition-all text-center btn-lift"
            style={{ background: "transparent", cursor: "pointer" }}
            aria-label="删除这封胶囊"
          >
            <IconTrash size={14} />
            删除这封胶囊
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDelete && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}

export default function CapsuleDetailPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <CapsuleDetail />
    </Suspense>
  );
}
