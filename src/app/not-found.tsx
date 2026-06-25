import Link from "next/link";
import { IconWarning, IconHome, IconPen } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
      <div className="text-center">
        {/* Decorative envelope */}
        <div className="relative mx-auto mb-8" style={{ width: 80, height: 58 }}>
          <svg
            width="80"
            height="58"
            viewBox="0 0 80 58"
            fill="none"
            className="text-amber/30"
          >
            <rect
              x="2"
              y="2"
              width="76"
              height="54"
              rx="4"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M2 6L40 32L78 6"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M2 18L40 44L78 18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              fill="none"
              opacity="0.5"
            />
          </svg>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-warm-muted/30 text-2xl font-serif"
            style={{ transform: "translate(-50%, -30%) rotate(-12deg)" }}
          >
            ?
          </div>
        </div>

        <div className="mb-4 inline-flex items-center justify-center">
          <IconWarning size={40} />
        </div>
        <h1 className="font-serif font-bold text-amber text-3xl md:text-4xl mb-4">
          这封信似乎迷路了
        </h1>
        <p className="font-sans text-warm-muted text-sm mb-10 max-w-xs mx-auto leading-relaxed">
          你打开的页面不存在，就像一封没有地址的信，不知道该寄往何方
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-8 py-3 bg-amber text-bg-deep font-sans font-semibold text-sm rounded-full hover:bg-amber-light transition-all duration-300 text-center btn-lift"
          >
            <IconHome size={16} />
            回到首页
          </Link>
          <Link
            href="/write"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-8 py-3 border border-amber/40 text-amber font-sans text-sm rounded-full hover:bg-amber/10 transition-all text-center btn-lift"
          >
            <IconPen size={16} />
            写一封信
          </Link>
        </div>
      </div>
    </div>
  );
}
