"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  type RecipientTime,
  calculateOpenDate,
  getSalutation,
  formatDateCN,
  getTodayCN,
  getMonthYearCN,
  saveLetter,
} from "@/lib/storage";
import { SealAnimation } from "@/components/SealAnimation";
import { IconPen, IconEnvelope, IconSmile, IconFrown, IconZap, IconHeartBroken, IconMeh, IconLightbulb, IconWarning } from "@/components/Icons";

const RECIPIENT_OPTIONS: RecipientTime[] = ["1年后", "6个月后", "3年后", "5年后"];

const MOODS = [
  { label: "期待", icon: IconSmile },
  { label: "焦虑", icon: IconFrown },
  { label: "充满干劲", icon: IconZap },
  { label: "有点难过", icon: IconHeartBroken },
  { label: "迷茫", icon: IconMeh },
  { label: "平静", icon: IconLightbulb },
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
    }
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sealedId, setSealedId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors] = useState<{ content?: string; wishes?: string; mood?: string }>({});
  const [contentFocus, setContentFocus] = useState(false);
  const [focusedWishIndex, setFocusedWishIndex] = useState<number | null>(null);
  const [moodAnimKey, setMoodAnimKey] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const draftRef = useRef<DraftData>({ recipient: "1年后", content: "", wishes: ["", "", ""], mood: "" });

  const openDate = useMemo(() => calculateOpenDate(recipient), [recipient]);
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
    if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
    const el = e.target;
    requestAnimationFrame(() => {
      el.style.height = "auto";
      el.style.height = Math.max(200, el.scrollHeight) + "px";
    });
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
      openAt: openDate.toISOString(),
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
          className="relative bg-paper rounded-2xl p-6 md:p-10 letter-lines card-border-transition"
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
                        className="block w-full text-left px-4 py-2.5 font-handwrite text-[#2a2420] text-base hover:bg-[rgba(212,165,116,0.1)] transition-colors"
                        style={{ background: "transparent", border: "none", cursor: "pointer" }}
                        role="option"
                        aria-selected={recipient === opt}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Postmark stamps */}
            <div className="flex flex-col items-end gap-1">
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
                {formatDateCN(openDate)} 开
              </span>
            </div>
          </div>

          {/* 2. Salutation */}
          <div className="mb-4">
            <p className="font-handwrite text-[#2a2420] text-xl md:text-[1.3rem]">
              亲爱的 {salutation} 的我：
            </p>
          </div>

          {/* 3. Letter Content */}
          <div className="mb-6 relative">
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
            {/* Character count */}
            <p
              className="font-sans text-xs text-right mt-1 absolute -bottom-5 right-0 flex items-center gap-1"
              style={{ color: contentLength < 10 && contentLength > 0 ? "#c46a4a" : isOverLimit ? "#d4a574" : "#a89888" }}
              aria-live="polite"
            >
              {contentLength < 10 && contentLength > 0 && (
                <span className="inline-flex items-center gap-0.5">
                  <IconWarning size={12} color="#c46a4a" />
                  至少 10 字
                </span>
              )}
              已写 {contentLength} 字
              {contentLength >= 10 && contentLength < 20 && "（可以提交了）"}
            </p>
          </div>

          {/* Spacer for character count absolute positioning */}
          <div className="h-5" />

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
                    className="text-[#c4a882]/40 hover:text-[#8a3a2a] transition-colors text-sm shrink-0 px-1"
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
                    className="px-4 py-2 rounded-full text-sm font-sans inline-flex items-center gap-1.5"
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
