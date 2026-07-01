"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  type TimeCapsuleLetter,
  getLetterById,
  getSalutation,
  formatDateCN,
  updateLetterReply,
} from "@/lib/storage";
import {
  IconEnvelope,
  IconRobot,
  IconScroll,
  IconPostbox,
  IconCheck,
  IconSave,
  IconPen,
  IconHome,
  IconMailbox,
  IconFastForward,
  IconClock,
} from "@/components/Icons";
import { useToast } from "@/components/Toast";

const REPLY_PROGRESS_KEY = (id: string) => `tc-reply-progress-${id}`;

function ReplyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const letterId = searchParams.get("id");
  const toast = useToast();

  const [letter, setLetter] = useState<TimeCapsuleLetter | null>(null);
  const [replyText, setReplyText] = useState("");
  const [fullText, setFullText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [animPhase, setAnimPhase] = useState(0);
  const [saved, setSaved] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const replyEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fullTextRef = useRef("");
  const displayedLengthRef = useRef(0);
  const isTypingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  // Load letter
  useEffect(() => {
    if (!letterId) {
      router.push("/write");
      return;
    }
    const found = getLetterById(letterId);
    if (!found) {
      router.push("/write");
      return;
    }
    setLetter(found);

    // Restore cached progress if any
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(REPLY_PROGRESS_KEY(letterId));
      if (cached && !found.aiReply) {
        fullTextRef.current = cached;
        setFullText(cached);
      }
    }
  }, [letterId, router]);

  // Envelope opening animation sequence
  // Phase 0→1 (500ms): envelope slides up from below
  // Phase 1→2 (2200ms): seal fades, flap opens, paper rises
  // Phase 2→3 (3800ms): envelope fades out, reply content appears
  useEffect(() => {
    if (!letter) return;
    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setAnimPhase(1), 500),
      setTimeout(() => setAnimPhase(2), 2200),
      setTimeout(() => setAnimPhase(3), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [letter]);

  // Typewriter scheduler
  const scheduleNextChar = useCallback(() => {
    if (displayedLengthRef.current >= fullTextRef.current.length) {
      isTypingRef.current = false;
      return;
    }

    const char = fullTextRef.current[displayedLengthRef.current];
    let pause = 18;
    if (["。", "！", "？", ".", "!", "?"].includes(char)) pause = 200;
    else if ([",", "，", "、", "；", ";"].includes(char)) pause = 100;
    else if (["…", "——"].includes(char)) pause = 80;
    else if (char === "\n") pause = 60;

    setTimeout(() => {
      displayedLengthRef.current += 1;
      setReplyText(fullTextRef.current.slice(0, displayedLengthRef.current));
      scheduleNextChar();
    }, pause);
  }, []);

  // Kick off typing when content is available
  useEffect(() => {
    if (animPhase !== 3) return;
    if (!isTypingRef.current && displayedLengthRef.current < fullTextRef.current.length) {
      isTypingRef.current = true;
      scheduleNextChar();
    }
  }, [animPhase, fullText, scheduleNextChar]);

  // Start AI reply generation when phase 3
  useEffect(() => {
    if (animPhase !== 3 || !letter) return;
    if (hasFetchedRef.current && !letter.aiReply) return;

    // Already has reply — show directly
    if (letter.aiReply) {
      fullTextRef.current = letter.aiReply;
      setFullText(letter.aiReply);
      displayedLengthRef.current = letter.aiReply.length;
      setReplyText(letter.aiReply);
      setIsDone(true);
      setIsGenerating(false);
      return;
    }

    hasFetchedRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    setIsGenerating(true);

    async function fetchReply() {
      try {
        const currentLetter = letter!;
        const res = await fetch("/api/reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            letterId: currentLetter.id,
            content: currentLetter.content,
            wishes: currentLetter.wishes,
            mood: currentLetter.mood,
            recipientTime: currentLetter.recipientTime,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "AI 服务暂时不可用");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("无法读取响应");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          fullTextRef.current = accumulated;
          setFullText(accumulated);

          // Save progress periodically
          if (typeof window !== "undefined" && accumulated.length % 40 < 10) {
            localStorage.setItem(REPLY_PROGRESS_KEY(currentLetter.id), accumulated);
          }
        }

        if (typeof window !== "undefined") {
          localStorage.setItem(REPLY_PROGRESS_KEY(currentLetter.id), accumulated);
        }

        setIsDone(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message || "生成失败，请稍后再试");
        }
      } finally {
        setIsGenerating(false);
      }
    }

    fetchReply();
    return () => controller.abort();
  }, [animPhase, letter]);

  // Optimized auto-scroll: only if cursor is near bottom of viewport
  useEffect(() => {
    if (!replyEndRef.current || skipped) return;
    const rect = replyEndRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    if (rect.bottom > viewportHeight - 80) {
      replyEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [replyText, skipped]);

  const handleSave = useCallback(() => {
    if (!letter || !fullTextRef.current) return;
    updateLetterReply(letter.id, fullTextRef.current);
    setSaved(true);
    toast.success("已保存到我的胶囊");
    if (typeof window !== "undefined") {
      localStorage.removeItem(REPLY_PROGRESS_KEY(letter.id));
    }
  }, [letter, toast]);

  const handleRetry = useCallback(() => {
    setReplyText("");
    setFullText("");
    setIsDone(false);
    setError(null);
    setIsGenerating(false);
    setSaved(false);
    setSkipped(false);
    fullTextRef.current = "";
    displayedLengthRef.current = 0;
    isTypingRef.current = false;
    hasFetchedRef.current = false;
    setAnimPhase(3);
  }, []);

  const handleSkip = useCallback(() => {
    setSkipped(true);
    displayedLengthRef.current = fullTextRef.current.length;
    setReplyText(fullTextRef.current);
    isTypingRef.current = false;
  }, []);

  if (!letter) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="mb-3 flex justify-center">
            <IconClock size={32} color="#a89888" className="animate-spin-slow" />
          </div>
          <p className="text-warm-muted font-sans text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  const salutation = getSalutation(letter.recipientTime);
  const openDate = new Date(letter.openAt);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-6 relative">
      {/* Skip animation button */}
      {animPhase >= 3 && !isDone && !error && !skipped && (
        <button
          type="button"
          onClick={handleSkip}
          className="fixed top-20 right-4 z-30 px-4 py-2.5 rounded-full text-[11px] font-sans text-warm-muted/70 border border-warm-muted/20 hover:border-amber/40 hover:text-amber transition-all"
          style={{ background: "rgba(26,21,18,0.8)", backdropFilter: "blur(8px)" }}
        >
          <span className="inline-flex items-center gap-1">
            跳过动画
            <IconFastForward size={12} />
          </span>
        </button>
      )}

      <div className="max-w-[720px] mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-handwrite text-amber text-2xl md:text-3xl mb-2 inline-flex items-center justify-center gap-2">
            <IconEnvelope size={24} />
            未来的你正在写回信...
          </h1>
          <p className="font-sans text-warm-muted text-xs">
            请稍等，穿越时空的信正在路上
          </p>
        </div>

        {/* Phase 0-2: Envelope Animation */}
        {animPhase < 3 && (
          <div className="flex justify-center mb-12">
            <div
              className="relative"
              style={{
                width: "280px",
                height: "200px",
                /* Phase 0→1: envelope slides up from below with fade-in */
                opacity: animPhase >= 1 ? 1 : 0,
                transform: animPhase >= 1 ? "translateY(0)" : "translateY(40px)",
                transition: "opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {/* Envelope body */}
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  background: "#faf3e8",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
                  transform: animPhase >= 2 ? "scaleY(0.8) translateY(-20px)" : "scaleY(1)",
                  opacity: animPhase >= 2 ? 0 : 1,
                  transition: "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
                  transitionDelay: animPhase >= 2 ? "0.6s" : "0s",
                }}
              />
              {/* Bottom flap */}
              <svg
                className="absolute bottom-0 left-0 w-full"
                viewBox="0 0 280 95"
                style={{
                  height: "95px",
                  opacity: animPhase >= 2 ? 0 : 1,
                  transition: "opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                  transitionDelay: animPhase >= 2 ? "0.4s" : "0s",
                }}
              >
                <path d="M0 0 L280 0 L140 95 Z" fill="#f0e8db" stroke="rgba(180,160,130,0.3)" strokeWidth="1" />
              </svg>
              {/* Top flap - opens with 1.2s duration, delayed after seal breaks */}
              <svg
                className="absolute top-0 left-0 w-full"
                viewBox="0 0 280 95"
                style={{
                  height: "95px",
                  transform: animPhase >= 2 ? "rotateX(180deg)" : "rotateX(0deg)",
                  transformOrigin: "top center",
                  opacity: animPhase >= 2 ? 0 : 1,
                  transition: "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                  transitionDelay: animPhase >= 2 ? "0.3s, 0.8s" : "0s, 0s",
                }}
              >
                <path d="M0 95 L280 95 L140 0 Z" fill="#e8ddd0" stroke="rgba(180,160,130,0.3)" strokeWidth="1" />
              </svg>
              {/* Wax seal - shrinks and fades out before flap opens */}
              <div
                className="absolute top-[55px] left-1/2"
                style={{
                  transform: animPhase >= 1
                    ? "translateX(-50%) scale(0) rotate(15deg)"
                    : "translateX(-50%) scale(1) rotate(0deg)",
                  opacity: animPhase >= 1 ? 0 : 1,
                  transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: "radial-gradient(circle at 35% 35%, #a04430, #8a3a2a)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  <span className="font-serif font-bold text-paper text-base" style={{ transform: "rotate(-3deg)" }}>封</span>
                </div>
              </div>

              {/* Paper sliding out - always rendered, starts inside envelope */}
              <div
                className="absolute left-4 right-4 rounded-lg"
                style={{
                  background: "#f0e8db",
                  height: "120px",
                  top: animPhase >= 2 ? "-80px" : "20px",
                  opacity: animPhase >= 2 ? 1 : 0,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                  transition: "top 1s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                  transitionDelay: animPhase >= 2 ? "0.8s, 0.6s" : "0s, 0s",
                  zIndex: animPhase >= 2 ? 10 : 0,
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
        )}

        {/* Phase 3: Reply Letter */}
        {animPhase >= 3 && (
          <div className="mb-8">
            <div
              className="relative bg-paper-alt rounded-2xl p-4 md:p-10 letter-lines card-border-transition"
              style={{
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.25), 0 12px 48px rgba(0,0,0,0.30)",
                border: "1px solid rgba(212,165,116,0.08)",
                animation: "unfold-letter 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards",
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
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
                    <span>AI 生成</span>
                  </span>
                  <span
                    className="inline-block px-3 py-1 rounded-full border-2 border-dashed border-amber/50 text-amber text-xs font-sans"
                    style={{ transform: "rotate(-5deg)" }}
                  >
                    {formatDateCN(openDate)}
                  </span>
                </div>
              </div>

              {/* Reply Content */}
              <div
                className="font-handwrite text-[#2a2420] text-base md:text-lg leading-[32px] min-h-[120px]"
                role="article"
                aria-label="AI 回信内容"
              >
                {isDone || letter.aiReply ? (
                  <div className="markdown-body" style={{ animation: "fade-in-content 0.5s ease forwards" }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {replyText || letter.aiReply || ""}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap markdown-body">
                    {replyText}
                    {/* Blinking cursor */}
                    {isGenerating && !isDone && (
                      <span
                        className="inline-block w-0.5 h-5 bg-amber ml-0.5 align-middle"
                        style={{ animation: "blink-cursor 1s step-end infinite" }}
                      />
                    )}
                  </div>
                )}
                <div ref={replyEndRef} />
              </div>

              {/* Error state */}
              {error && (
                <div className="mt-6 text-center">
                  <p className="font-sans text-warm-muted text-sm mb-3">{error}</p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="px-5 py-2 border border-amber/40 text-amber font-sans text-sm rounded-full hover:bg-amber/10 transition-all btn-lift"
                    style={{ background: "transparent", cursor: "pointer" }}
                  >
                    重新生成
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Original Letter (expandable) */}
        {isDone && (
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setShowOriginal(!showOriginal)}
              className="w-full flex items-center justify-center gap-2 py-3 font-sans text-amber text-sm hover:underline transition-all btn-lift"
              style={{ background: "transparent", border: "none", cursor: "pointer" }}
              aria-expanded={showOriginal}
              aria-label="切换原信显示"
            >
              {showOriginal ? (
                <span className="inline-flex items-center gap-1">收起我的原信</span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <IconScroll size={14} />
                  查看我的原信
                </span>
              )}
            </button>

            {showOriginal && (
              <div className="mt-4 relative">
                {/* Original letter card */}
                <div
                  className="bg-paper rounded-2xl p-4 md:p-10 letter-lines card-border-transition"
                  style={{
                    boxShadow: "0 4px 20px rgba(0,0,0,0.25), 0 1px 4px rgba(0,0,0,0.15)",
                    animation: "unfold-letter 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
                  }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <span className="font-sans text-sm text-[#6a5a4a] inline-flex items-center gap-1">
                      <IconPostbox size={14} />
                      {formatDateCN(new Date(letter.createdAt))} 的我
                    </span>
                    <span className="font-sans text-xs text-[#8a7a6a]">
                      {letter.mood}
                    </span>
                  </div>
                  <div className="font-handwrite text-[#2a2420] text-base md:text-lg leading-[32px] whitespace-pre-wrap">
                    {letter.content}
                  </div>
                  {letter.wishes.length > 0 && (
                    <div className="mt-4">
                      <p className="font-handwrite text-[#2a2420] text-base mb-2">我希望那时的你：</p>
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
          </div>
        )}

        {/* Typing complete indicator */}
        {isDone && !error && (
          <div className="flex items-center justify-center gap-2 mt-4 fade-in">
            <IconCheck size={14} color="#d4a574" />
            <span className="font-sans text-amber/60 text-xs">回信已完成</span>
          </div>
        )}

        {/* Reply complete divider */}
        {isDone && !error && (
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(212,165,116,0.2), transparent)" }} />
            <span className="font-sans text-warm-muted/40 text-[10px] tracking-widest uppercase">回信结束</span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(212,165,116,0.2), transparent)" }} />
          </div>
        )}

        {/* Action Buttons */}
        {isDone && !error && (
          <div
            className="flex flex-col items-center gap-3 mt-8 transition-all duration-700"
            style={{
              opacity: isDone ? 1 : 0,
              transform: isDone ? "translateY(0)" : "translateY(20px)",
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {/* Primary: Save */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saved}
              className="w-full max-w-[320px] px-8 py-4 bg-amber text-bg-deep font-sans font-semibold text-sm rounded-xl btn-lift disabled:opacity-60 disabled:transform-none"
              style={{
                boxShadow: saved ? "none" : "0 0 0 rgba(212,165,116,0)",
              }}
              onMouseEnter={(e) => {
                if (!saved) e.currentTarget.style.boxShadow = "0 8px 32px rgba(212,165,116,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 0 rgba(212,165,116,0)";
              }}
            >
              {saved ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <IconCheck size={16} />
                  已保存到我的胶囊
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  保存到我的胶囊
                  <IconSave size={16} />
                </span>
              )}
            </button>

            {/* Secondary buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-[320px]">
              {isDone && !error && (
                <button
                  type="button"
                  onClick={() => {
                    setReplyText("");
                    setIsDone(false);
                    setIsGenerating(true);
                    setError(null);
                    // Re-trigger the streaming by reloading
                    window.location.reload();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 border border-amber/30 text-amber font-sans text-sm rounded-full hover:bg-amber/10 transition-all text-center btn-lift inline-flex items-center justify-center gap-1.5"
                  style={{ cursor: "pointer" }}
                >
                  重新生成回信
                </button>
              )}
              <Link
                href="/write"
                className="w-full sm:w-auto px-6 py-2.5 border border-amber/40 text-amber font-sans text-sm rounded-full hover:bg-amber/10 transition-all text-center btn-lift inline-flex items-center justify-center gap-1.5"
              >
                <IconPen size={14} />
                再写一封
              </Link>
              <Link
                href="/capsules"
                className="w-full sm:w-auto px-6 py-2.5 border border-amber/40 text-amber font-sans text-sm rounded-full hover:bg-amber/10 transition-all text-center btn-lift inline-flex items-center justify-center gap-1.5"
              >
                <IconMailbox size={14} />
                查看我的胶囊
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes paper-rise {
          0% {
            transform: translateY(60px);
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
          70% {
            transform: translateY(-8px);
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default function ReplyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="mb-3 flex justify-center">
              <IconClock size={32} color="#a89888" className="animate-spin-slow" />
            </div>
            <p className="text-warm-muted font-sans text-sm">加载中...</p>
          </div>
        </div>
      }
    >
      <ReplyContent />
    </Suspense>
  );
}
