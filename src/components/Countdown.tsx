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
