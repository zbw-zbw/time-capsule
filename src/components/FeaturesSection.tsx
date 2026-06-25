import { IconPen, IconEnvelope, IconHourglass, IconSparkles } from "@/components/Icons";

const features = [
  {
    icon: <IconPen size={32} className="text-amber" />,
    title: "写给未来",
    description:
      "在信纸上给1年后的自己写信，设定你的目标、愿望和此刻的心情",
  },
  {
    icon: <IconEnvelope size={32} className="text-amber" />,
    title: "AI 回信",
    description:
      "「未来的你」根据信件内容温柔回复，不是鸡汤，而是基于你目标的理性+感性分析",
  },
  {
    icon: <IconHourglass size={32} className="text-amber" />,
    title: "真实封存",
    description:
      "信件被封存1年，到期后发送通知，届时打开信件验证「未来的你」说得准不准",
  },
];

export function FeaturesSection() {
  return (
    <section className="w-full px-6 py-20 md:py-28">
      <div className="max-w-[900px] mx-auto">
        {/* Section title */}
        <div className="fade-in text-center mb-14">
          <h2 className="font-serif text-warm-white text-xl md:text-2xl">
            <IconSparkles size={20} className="text-amber inline-block mr-2" />
            时间胶囊能做什么
          </h2>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={i}
              className="fade-in group rounded-2xl p-6 md:p-8 border transition-all duration-300 hover:border-amber/40 hover:shadow-lg hover:shadow-amber/5"
              style={{
                backgroundColor: "rgba(35,30,25,0.6)",
                borderColor: "rgba(212,165,116,0.15)",
              }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="font-serif font-bold text-warm-white text-lg mb-3">
                {feature.title}
              </h3>
              <p className="text-warm-muted text-sm font-sans leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
