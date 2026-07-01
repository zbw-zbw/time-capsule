import Link from "next/link";
import { IconEnvelope, IconPen } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
      <div className="text-center" style={{ animation: "fade-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}>
        {/* Envelope with question mark */}
        <div className="relative mx-auto mb-8" style={{ width: "120px", height: "90px" }}>
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background: "#faf3e8",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              opacity: 0.15,
            }}
          />
          <svg width="120" height="90" viewBox="0 0 120 90" fill="none" className="absolute inset-0">
            <rect x="6" y="6" width="108" height="78" rx="4" stroke="#d4a574" strokeWidth="2" fill="none" opacity="0.4"/>
            <path d="M6 12L60 48L114 12" stroke="#d4a574" strokeWidth="2" strokeLinejoin="round" fill="none" opacity="0.4"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-amber text-3xl font-bold opacity-60">404</span>
          </div>
        </div>

        <h1 className="font-serif font-bold text-amber text-xl mb-3">
          这封信似乎迷失在时间里了
        </h1>
        <p className="font-sans text-warm-muted text-sm mb-8 max-w-xs mx-auto leading-relaxed">
          你访问的页面不存在，或许它还没被写出来
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber text-[#1a1512] font-sans text-sm font-medium hover:bg-amber/90 transition-all btn-lift"
          >
            <IconEnvelope size={16} color="#1a1512" />
            回到首页
          </Link>
          <Link
            href="/write"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-amber/30 text-amber font-sans text-sm hover:bg-amber/10 transition-all btn-lift"
          >
            <IconPen size={16} />
            写一封信
          </Link>
        </div>

        <p className="font-sans text-warm-muted/30 text-[10px] mt-12">
          快捷键：W 写信 · C 我的胶囊 · H 首页
        </p>
      </div>
    </div>
  );
}
