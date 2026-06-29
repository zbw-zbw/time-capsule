"use client";

import Link from "next/link";
import { useCapsuleCount } from "@/lib/storage";
import { IconPen, IconEnvelope, IconHourglass, IconMailbox } from "@/components/Icons";

export function HeroSection() {
  const { total: capsuleCount } = useCapsuleCount();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Decorative floating envelopes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[15%] left-[10%] opacity-20"
          style={{ animation: "float-envelope 6s ease-in-out infinite" }}
        >
          <IconEnvelope size={48} color="#d4a574" />
        </div>
        <div
          className="absolute top-[25%] right-[12%] opacity-15"
          style={{
            animation: "float-envelope 8s ease-in-out infinite",
            animationDelay: "1s",
          }}
        >
          <IconEnvelope size={36} color="#d4a574" />
        </div>
        <div
          className="absolute bottom-[20%] left-[15%] opacity-10"
          style={{
            animation: "float-envelope 7s ease-in-out infinite",
            animationDelay: "2s",
          }}
        >
          <IconEnvelope size={28} color="#d4a574" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-[640px]">
        {/* Eyebrow */}
        <div className="fade-in mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-sans tracking-wide"
            style={{ backgroundColor: "rgba(212,165,116,0.1)", color: "#d4a574" }}
          >
            <IconHourglass size={14} />
            把此刻的心情封存进时间胶囊
          </span>
        </div>

        {/* Title */}
        <div className="fade-in mb-6">
          <h1 className="font-serif font-bold text-amber text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight">
            写给未来的
            <br />
            一封信
          </h1>
        </div>

        {/* Subtitle */}
        <div className="fade-in mb-10">
          <p className="font-sans text-warm-muted text-sm md:text-base leading-relaxed max-w-md mx-auto">
            把此刻的心情封存进时间胶囊
            <br className="hidden md:block" />
            AI 会扮演"未来的你"提前回信
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="fade-in flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/write"
            className="w-full sm:w-auto px-8 py-4 bg-amber text-bg-deep font-sans font-semibold text-sm rounded-full hover:bg-amber-light transition-all duration-300 btn-lift"
            style={{
              boxShadow: "0 8px 32px rgba(212,165,116,0.25)",
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <IconPen size={16} />
              写一封信
            </span>
          </Link>

          {capsuleCount > 0 && (
            <Link
              href="/capsules"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-sm text-amber/80 hover:text-amber border border-amber/20 hover:border-amber/40 transition-all duration-300 btn-lift"
            >
              <IconMailbox size={16} color="#d4a574" />
              查看我的胶囊
            </Link>
          )}
        </div>

        {/* Capsule count hint */}
        {capsuleCount > 0 && (
          <div className="fade-in">
            <p className="font-sans text-warm-muted/60 text-xs">
              已封存 {capsuleCount} 封信
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
