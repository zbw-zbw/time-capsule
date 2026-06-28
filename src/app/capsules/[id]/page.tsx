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

function Countdown({ targetDate }: { targetDate: string }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const target = new Date(targetDate).getTime();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const blocks = [
    { value: days, unit: "天" },
    { value: hours, unit: "时" },
    { value: minutes, unit: "分" },
    { value: seconds, unit: "秒" },
  ];

  return (
    <div className="text-center mb-10">
      <p className="font-sans text-warm-muted text-sm mb-4 inline-flex items-center gap-1 justify-center">
        <IconClock size={14} />
        距离开启还有
      </p>
      <div className="flex items-center justify-center gap-2 md:gap-3">
        {blocks.map((block, i) => (
          <div key={i} className="flex items-center gap-2 md:gap-3">
            <div
              className="w-12 h-14 md:w-16 md:h-20 rounded-lg flex flex-col items-center justify-center"
              style={{ backgroundColor: "rgba(35,30,25,0.8)", border: "1px solid rgba(212,165,116,0.2)" }}
            >
              <span className="font-serif text-amber text-xl md:text-2xl font-bold">
                {String(block.value).padStart(2, "0")}
              </span>
              <span className="font-sans text-warm-muted/60 text-[10px] md:text-xs">
                {block.unit}
              </span>
            </div>
            {i < 3 && (
              <span className="text-amber/50 text-lg md:text-xl font-bold">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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

  const [letter, setLetter] = useState<TimeCapsuleLetter | null>(null);
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
      setLetter(found);
    } else {
      setLetter(null);
    }
  }, [letterId]);

  const handleDelete = useCallback(() => {
    deleteLetter(letterId);
    router.push("/capsules");
  }, [letterId, router]);

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
  const showCountdown = letter.status !== "opened";
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
            {letter.status === "opened" ? (
              <>
                <IconCheck size={12} />
                已开启
              </>
            ) : letter.status === "replied" ? (
              <>
                <IconEnvelope size={12} />
                已回信
              </>
            ) : (
              <>
                <IconClock size={12} />
                等待中
              </>
            )}
          </span>
        </div>

        {/* Countdown */}
        {showCountdown && <Countdown targetDate={letter.openAt} />}

        {/* Original Letter */}
        <div className="mb-4">
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

        {/* AI Reply */}
        {showReply && (
          <div className="mb-8">
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mt-8">
          <Link
            href="/write"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-6 py-2.5 border border-amber/40 text-amber font-sans text-sm rounded-full hover:bg-amber/10 transition-all text-center btn-lift"
          >
            <IconPen size={14} />
            再写一封
          </Link>
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
