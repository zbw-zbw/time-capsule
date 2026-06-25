"use client";

import Link from "next/link";
import { useCapsuleCount } from "@/lib/storage";

function FloatingEnvelope({
  size,
  opacity,
  top,
  left,
  delay,
  duration,
}: {
  size: number;
  opacity: number;
  top: string;
  left: string;
  delay: string;
  duration: string;
}) {
  return (
    <div
      className="absolute pointer-events-none hidden md:block"
      style={{
        top,
        left,
        opacity,
        animation: `float-envelope ${duration} ease-in-out ${delay} infinite`,
      }}
    >
      <svg
        width={size}
        height={size * 0.7}
        viewBox="0 0 80 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="1"
          y="1"
          width="78"
          height="54"
          rx="4"
          stroke="rgba(212,165,116,0.3)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M1 5L40 30L79 5"
          stroke="rgba(212,165,116,0.3)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  );
}

export function HeroSection() {
  const { total: capsuleCount } = useCapsuleCount();

  return (
    <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 px-6 text-center overflow-hidden">
      {/* Floating envelopes */}
      <FloatingEnvelope
        size={60}
        opacity={0.15}
        top="15%"
        left="8%"
        delay="0s"
        duration="6s"
      />
      <FloatingEnvelope
        size={45}
        opacity={0.1}
        top="25%"
        left="85%"
        delay="1s"
        duration="7s"
      />
      <FloatingEnvelope
        size={35}
        opacity={0.12}
        top="60%"
        left="12%"
        delay="2s"
        duration="8s"
      />
      <FloatingEnvelope
        size={50}
        opacity={0.08}
        top="70%"
        left="80%"
        delay="0.5s"
        duration="6.5s"
      />

      {/* Postmark stamp */}
      <div className="fade-in mb-8 inline-block">
        <div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border-2 border-dashed border-amber/40 text-amber/70 text-xs font-sans tracking-widest"
          style={{ transform: "rotate(-5deg)" }}
        >
          <span>TRAE AI 创造力大赛</span>
          <span className="text-amber/40">·</span>
          <span>2026</span>
        </div>
      </div>

      {/* Main title */}
      <h1 className="fade-in font-serif font-bold text-amber text-5xl md:text-7xl mb-6 tracking-wide">
        时间胶囊
      </h1>

      {/* Subtitle */}
      <p className="fade-in font-handwrite text-warm-white text-xl md:text-2xl mb-8">
        给未来的自己写一封信
      </p>

      {/* Description */}
      <p className="fade-in font-serif text-warm-muted text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed">
        AI帮&ldquo;未来的你&rdquo;提前回信——你不用等一年，
        <br className="hidden md:block" />
        就能听到未来的自己想对你说什么
      </p>

      {/* CTA Button */}
      <div className="fade-in">
        <Link
          href="/write"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber text-bg-deep font-sans font-semibold text-sm rounded-full hover:bg-amber-light transition-all duration-300 hover:shadow-lg hover:shadow-amber/20"
          style={{ animation: "glow-pulse 3s ease-in-out infinite" }}
        >
          开始写信 ✉️
        </Link>
      </div>

      {/* Capsule count hint */}
      {capsuleCount > 0 && (
        <div className="fade-in mt-5">
          <Link
            href="/capsules"
            className="font-sans text-warm-muted/70 text-xs hover:text-amber transition-colors"
          >
            你已经写了 {capsuleCount} 封信 · 查看我的胶囊 →
          </Link>
        </div>
      )}

      {/* Bounce arrow */}
      <div
        className="absolute bottom-8 left-1/2 text-warm-muted/50 text-sm font-sans flex flex-col items-center gap-1"
        style={{ animation: "bounce-down 2s ease-in-out infinite" }}
      >
        <span>往下看看</span>
        <span>↓</span>
      </div>
    </section>
  );
}
