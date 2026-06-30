"use client";

import { useState, useRef, useCallback } from "react";
import { useToast } from "@/components/Toast";

interface ShareCardProps {
  recipientTime: string;
  createdAt: string;
  openAt: string;
  mood: string;
  contentPreview: string;
}

export function ShareCard({ recipientTime, createdAt, openAt, mood, contentPreview }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const generateShareText = useCallback(() => {
    const text = `🕐 一封时间胶囊正在等待开启\n\n` +
      `寄给：${recipientTime}后的自己\n` +
      `心情：${mood}\n` +
      `寄出：${createdAt}\n` +
      `开启：${openAt}\n\n` +
      `"${contentPreview.slice(0, 50)}..."\n\n` +
      `来「时间胶囊」给未来的自己写一封信吧 ✉️`;
    return text;
  }, [recipientTime, createdAt, openAt, mood, contentPreview]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      toast.success("分享文案已复制到剪贴板");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("复制失败，请手动复制");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-5 py-2.5 border border-amber/30 text-amber font-sans text-sm rounded-full hover:bg-amber/10 transition-all text-center btn-lift"
      style={{ cursor: "pointer" }}
    >
      {copied ? (
        <span className="inline-flex items-center gap-1">
          ✓ 已复制
        </span>
      ) : (
        <>
          分享这封信
        </>
      )}
    </button>
  );
}
