import Link from "next/link";

export function FooterSection() {
  return (
    <section className="w-full px-6 py-20 md:py-28">
      <div className="max-w-[900px] mx-auto text-center">
        {/* Closing quote */}
        <div className="fade-in mb-10">
          <p className="font-handwrite text-amber text-2xl md:text-4xl leading-relaxed">
            愿你读到这封信时，
            <br />
            比写信的那天更好
          </p>
        </div>

        {/* CTA */}
        <div className="fade-in mb-12">
          <Link
            href="/write"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber text-bg-deep font-sans font-semibold text-sm rounded-full hover:bg-amber-light transition-all duration-300 hover:shadow-lg hover:shadow-amber/20"
          >
            写一封信给未来的自己 →
          </Link>
        </div>

        {/* Wax seal */}
        <div className="fade-in flex justify-center mb-12">
          <div
            className="w-16 h-16 rounded-full bg-seal-red flex items-center justify-center shadow-lg"
            style={{
              animation: "seal-pulse 3s ease-in-out infinite",
              transform: "rotate(-3deg)",
            }}
          >
            <span className="text-paper font-serif font-bold text-lg">封</span>
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="fade-in flex flex-col md:flex-row items-center justify-between gap-3 text-warm-muted/50 text-xs font-sans">
          <span>2026 · 06</span>
          <span>
            《时间胶囊》· 写给未来的自己
          </span>
          <span>让时间传递温暖</span>
        </div>
      </div>
    </section>
  );
}
