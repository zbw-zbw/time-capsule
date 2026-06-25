export function LetterShowcase() {
  return (
    <section className="w-full px-6 py-20 md:py-28 border-t border-rule">
      <div className="max-w-[900px] mx-auto">
        {/* Section title */}
        <div className="fade-in text-center mb-16">
          <h2 className="font-serif font-bold text-amber text-2xl md:text-3xl mb-3">
            一封信，两个时空
          </h2>
          <p className="text-warm-muted text-sm font-sans">
            你写给未来 &mdash; AI 扮演&ldquo;未来的你&rdquo;回信
          </p>
        </div>

        {/* Letter 1: You write to the future */}
        <div className="fade-in mb-8">
          <div
            className="relative bg-paper rounded-xl p-6 md:p-10 letter-lines card-border-transition"
            style={{
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.25), 0 12px 48px rgba(0,0,0,0.30)",
              border: "1px solid rgba(212,165,116,0.08)",
            }}
          >
            {/* Sender label */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-sans text-[#6a5a4a]">
                📮 2026年6月的我
              </span>
              {/* Postmark stamp: double-ring, aged effect */}
              <div
                className="relative inline-flex items-center justify-center"
                style={{
                  width: 68,
                  height: 68,
                  transform: "rotate(-8deg)",
                  opacity: 0.85,
                }}
              >
                {/* Outer ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: "2px solid rgba(180,150,110,0.45)",
                  }}
                />
                {/* Inner ring */}
                <div
                  className="absolute rounded-full"
                  style={{
                    top: 4,
                    left: 4,
                    right: 4,
                    bottom: 4,
                    border: "1px solid rgba(180,150,110,0.25)",
                  }}
                />
                {/* Aged splotches */}
                <div
                  className="absolute rounded-full"
                  style={{
                    top: 10,
                    left: 14,
                    width: 6,
                    height: 6,
                    background: "rgba(180,150,110,0.15)",
                  }}
                />
                <div
                  className="absolute rounded-full"
                  style={{
                    bottom: 12,
                    right: 16,
                    width: 4,
                    height: 4,
                    background: "rgba(180,150,110,0.12)",
                  }}
                />
                {/* Date text */}
                <div className="text-center leading-tight">
                  <div className="font-sans text-[9px] text-[#a08a6a] tracking-wider">
                    TIME CAPSULE
                  </div>
                  <div className="font-sans text-[10px] text-[#8a7a6a] font-bold mt-0.5">
                    2026.06.25
                  </div>
                  <div className="font-sans text-[8px] text-[#b0a08a] mt-0.5">
                    POSTED
                  </div>
                </div>
              </div>
            </div>

            {/* Letter content */}
            <div className="font-handwrite text-[#2a2420] text-base md:text-lg leading-[32px]">
              <p className="mb-4">亲爱的一年后的我：</p>
              <p className="mb-4">
                你好啊。现在的我刚换了一份新工作，说实话有点焦虑，
                <br />
                不知道这个选择对不对。
              </p>
              <p className="mb-4">我希望一年后的你：</p>
              <p className="mb-1 ml-4">1. 已经适应了新环境，有了可以信任的同事</p>
              <p className="mb-1 ml-4">
                2. 开始学习系统设计，技术能力上了一个台阶
              </p>
              <p className="mb-4 ml-4">3. 存够了一万块的旅行基金，去一次日本</p>
              <p className="mb-4">
                如果这些都没实现也没关系，
                <br />
                至少希望你比现在的我更勇敢一点。
              </p>
              <p className="text-right mt-6">2026年6月的我</p>
            </div>
          </div>
        </div>

        {/* Transition: Envelope + AI processing */}
        <div className="fade-in flex flex-col items-center py-8">
          {/* Envelope icon */}
          <div className="relative mb-4">
            <svg
              width="48"
              height="34"
              viewBox="0 0 48 34"
              fill="none"
              className="text-amber/60"
            >
              <rect
                x="1"
                y="1"
                width="46"
                height="32"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M1 4L24 20L47 4"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
            {/* Arrow */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-amber/60 text-lg">
              ↓
            </div>
          </div>
          <p className="text-warm-muted/70 text-xs font-sans tracking-wide">
            ⏳ AI 模拟&ldquo;未来的你&rdquo;回信中...
          </p>
        </div>

        {/* Letter 2: AI reply */}
        <div className="fade-in">
          <div
            className="relative bg-paper-alt rounded-xl p-6 md:p-10 letter-lines card-border-transition"
            style={{
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.25), 0 12px 48px rgba(0,0,0,0.30)",
              border: "1px solid rgba(212,165,116,0.08)",
              animation: "unfold-letter 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
            }}
          >
            {/* AI label */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-sans text-[#6a5a4a]">
                💌 2027年6月的你
              </span>
              <div className="flex items-center gap-2">
                {/* Smaller, subtler AI tag */}
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber/15 text-amber text-[11px] font-sans font-medium"
                  style={{ letterSpacing: "0.02em" }}
                >
                  <span className="text-[10px]">🤖</span>
                  <span>AI 生成</span>
                </span>
                {/* Postmark stamp for reply */}
                <div
                  className="relative inline-flex items-center justify-center"
                  style={{
                    width: 56,
                    height: 56,
                    transform: "rotate(-5deg)",
                    opacity: 0.8,
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ border: "2px solid rgba(180,150,110,0.40)" }}
                  />
                  <div
                    className="absolute rounded-full"
                    style={{
                      top: 3,
                      left: 3,
                      right: 3,
                      bottom: 3,
                      border: "1px solid rgba(180,150,110,0.22)",
                    }}
                  />
                  <div className="text-center leading-tight">
                    <div className="font-sans text-[8px] text-[#a08a6a]">
                      REPLY
                    </div>
                    <div className="font-sans text-[9px] text-[#8a7a6a] font-bold mt-0.5">
                      2027.06.25
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Letter content */}
            <div className="font-handwrite text-[#2a2420] text-base md:text-lg leading-[32px]">
              <p className="mb-4">2026年的自己：</p>
              <p className="mb-4">读到你的信，眼眶有点热。</p>
              <p className="mb-4">
                关于新工作——你知道吗，你当时焦虑是正常的。
                <br />
                第3个月的时候最难熬，但第5个月开始，你会遇到
                <br />
                一个愿意带你的mentor。到现在，你已经能独立
                <br />
                负责一个模块了。所以，这个选择没有错。
              </p>
              <p className="mb-4">关于那三个愿望：</p>
              <p className="mb-1 ml-4">
                ✅ 同事已经不只是同事了，你们周末还一起打过羽毛球
              </p>
              <p className="mb-1 ml-4">
                📖 系统设计…说实话学了一半，但你开始写技术博客了，
                <br />
                <span className="ml-8">
                  这是当初没想到的意外收获
                </span>
              </p>
              <p className="mb-4 ml-4">
                ✈️ 旅行基金存了八千，差一点点。不过你去了一次厦门，
                <br />
                <span className="ml-8">拍了很美的照片</span>
              </p>
              <p className="mb-4">
                你让我&ldquo;更勇敢一点&rdquo;。我想告诉你：
                <br />
                你已经很勇敢了。换工作本身就是勇敢。
                <br />
                未来的一年不会完美，但会比你想象的更好。
              </p>
              <p className="text-right mt-6">一年后的你</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
