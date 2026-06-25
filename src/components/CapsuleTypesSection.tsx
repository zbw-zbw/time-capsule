import { IconCalendar, IconGraduation, IconBriefcase, IconHeartBroken, IconMailbox } from "@/components/Icons";

const capsuleTypes = [
  {
    icon: <IconCalendar size={28} className="text-amber" />,
    name: "新年胶囊",
    description: "「今年的我对明年的我说...」",
    color: "from-amber/20 to-amber/5",
  },
  {
    icon: <IconGraduation size={28} className="text-amber" />,
    name: "毕业胶囊",
    description: "「22岁的我对25岁的我说...」",
    color: "from-rose/20 to-rose/5",
  },
  {
    icon: <IconBriefcase size={28} className="text-amber" />,
    name: "入职胶囊",
    description: "「入职第一天的我，对一年后的我说...」",
    color: "from-amber/20 to-amber/5",
  },
  {
    icon: <IconHeartBroken size={28} className="text-amber" />,
    name: "转折胶囊",
    description: "「分手那天的我，对疗愈后的我说...」",
    color: "from-rose/20 to-rose/5",
  },
];

export function CapsuleTypesSection() {
  return (
    <section className="w-full px-6 py-20 md:py-28">
      <div className="max-w-[900px] mx-auto">
        {/* Section title */}
        <div className="fade-in text-center mb-14">
          <h2 className="font-serif text-warm-white text-xl md:text-2xl">
            <IconMailbox size={20} className="text-amber inline-block mr-2" />
            哪些时刻值得写一封信
          </h2>
        </div>

        {/* Capsule type cards - 2x2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {capsuleTypes.map((capsule, i) => (
            <div
              key={i}
              className="fade-in group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:border-amber/30"
              style={{
                backgroundColor: "rgba(35,30,25,0.6)",
                borderColor: "rgba(212,165,116,0.12)",
              }}
            >
              {/* V-fold decoration at top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[40px] border-r-[40px] border-t-[20px] border-l-transparent border-r-transparent border-t-bg-deep/80" />

              <div className="p-6 md:p-8 pt-10">
                <div className="mb-3">{capsule.icon}</div>
                <h3 className="font-serif font-bold text-warm-white text-base mb-2">
                  {capsule.name}
                </h3>
                <p className="font-handwrite text-warm-muted text-sm">
                  {capsule.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
