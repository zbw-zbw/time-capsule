import { IconLightbulb } from "@/components/Icons";

export function ComparisonSection() {
  return (
    <section className="w-full px-6 py-20 md:py-28">
      <div className="max-w-[900px] mx-auto">
        {/* Section title */}
        <div className="fade-in text-center mb-14">
          <h2 className="font-serif text-warm-white text-xl md:text-2xl">
            <IconLightbulb size={20} className="text-amber inline-block mr-2" />
            为什么不是普通时间胶囊
          </h2>
        </div>

        {/* Comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional */}
          <div
            className="fade-in rounded-2xl p-6 md:p-8 border transition-all duration-300"
            style={{
              backgroundColor: "rgba(35,30,25,0.4)",
              borderColor: "rgba(168,152,136,0.2)",
            }}
          >
            <h3 className="font-serif text-warm-muted text-lg mb-6">
              传统时间胶囊
            </h3>

            {/* Flow */}
            <div className="flex items-center gap-3 mb-6">
              {["写", "等一年", "开"].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="inline-block px-4 py-2 rounded-lg bg-warm-muted/10 text-warm-muted text-sm font-sans">
                    {step}
                  </span>
                  {i < 2 && (
                    <span className="text-warm-muted/30 text-lg">→</span>
                  )}
                </div>
              ))}
            </div>

            <p className="text-warm-muted/70 text-sm font-sans leading-relaxed">
              中间漫长的空白期，热情消散，大多数人到时候已经忘了
            </p>
          </div>

          {/* AI Time Capsule */}
          <div
            className="fade-in rounded-2xl p-6 md:p-8 border-2 transition-all duration-300"
            style={{
              backgroundColor: "rgba(35,30,25,0.6)",
              borderColor: "rgba(212,165,116,0.4)",
              animation: "seal-pulse 4s ease-in-out infinite",
            }}
          >
            <h3 className="font-serif text-amber text-lg mb-6">
              AI 时间胶囊
            </h3>

            {/* Flow */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {["写", "AI立刻回信", "带着温暖继续生活", "一年后开信验证"].map(
                (step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="inline-block px-3 py-2 rounded-lg bg-amber/15 text-amber text-sm font-sans">
                      {step}
                    </span>
                    {i < 3 && (
                      <span className="text-amber/30 text-lg">→</span>
                    )}
                  </div>
                )
              )}
            </div>

            <p className="text-warm-white/80 text-sm font-sans leading-relaxed">
              双向对话，情感密度翻倍，AI回信给你当下就有的力量
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
