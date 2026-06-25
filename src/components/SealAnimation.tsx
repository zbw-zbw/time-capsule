"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconEnvelope } from "@/components/Icons";

interface SealAnimationProps {
  letterId: string;
  letterPreview?: string;
  onComplete?: () => void;
}

export function SealAnimation({ letterId, letterPreview, onComplete }: SealAnimationProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(
      setTimeout(() => setStep(1), 0),
      setTimeout(() => setStep(2), 1000),
      setTimeout(() => setStep(3), 2000),
      setTimeout(() => setStep(4), 3000)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (step >= 4) {
      const t = setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          router.push(`/reply?id=${letterId}`);
        }
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [step, letterId, router, onComplete]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        backgroundColor: step > 0 ? "rgba(26,21,18,0.85)" : "rgba(26,21,18,0)",
        transition: "background-color 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="flex flex-col items-center">
        {/* Step 1: Paper folding */}
        <div
          className="relative transition-all duration-1000"
          style={{
            transform:
              step === 0
                ? "scaleY(1) translateY(0)"
                : step >= 1
                ? "scaleY(0.3) translateY(-40px)"
                : "scaleY(1) translateY(0)",
            opacity: step === 0 ? 1 : step >= 1 ? 0 : 1,
            width: "100%",
            maxWidth: "560px",
            pointerEvents: "none",
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div
            className="bg-paper rounded-xl p-8 shadow-2xl letter-lines"
            style={{
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.25), 0 12px 48px rgba(0,0,0,0.30)",
            }}
          >
            <div className="font-handwrite text-[#2a2420] text-lg leading-[32px]">
              {letterPreview ? (
                <p className="whitespace-pre-wrap line-clamp-5">{letterPreview}...</p>
              ) : (
                <p>把此刻的心情写进信封...</p>
              )}
            </div>
          </div>
          {/* Fold crease shadow */}
          <div
            className="absolute left-0 right-0 top-1/2 h-px pointer-events-none transition-opacity duration-500"
            style={{
              background: "rgba(0,0,0,0.06)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              opacity: step >= 1 ? 1 : 0,
            }}
          />
        </div>

        {/* Step 2: Envelope */}
        <div
          className="absolute transition-all duration-1000"
          style={{
            transform:
              step < 1
                ? "translateY(120%)"
                : step === 1
                ? "translateY(0)"
                : step >= 2
                ? "translateY(0)"
                : "translateY(120%)",
            opacity: step >= 1 ? 1 : 0,
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div className="relative" style={{ width: "280px", height: "190px" }}>
            {/* Envelope body */}
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: "#faf3e8",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
              }}
            />
            {/* Bottom flap (open) */}
            <svg
              className="absolute bottom-0 left-0 w-full"
              viewBox="0 0 280 95"
              style={{ height: "95px" }}
            >
              <path
                d="M0 0 L280 0 L140 95 Z"
                fill="#f0e8db"
                stroke="rgba(180,160,130,0.3)"
                strokeWidth="1"
              />
            </svg>
            {/* Top flap */}
            <svg
              className="absolute top-0 left-0 w-full transition-all duration-700"
              viewBox="0 0 280 95"
              style={{
                height: "95px",
                transform:
                  step >= 2
                    ? "rotateX(180deg)"
                    : "rotateX(0deg)",
                transformOrigin: "top center",
                opacity: step >= 2 ? 0 : 1,
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <path
                d="M0 95 L280 95 L140 0 Z"
                fill="#e8ddd0"
                stroke="rgba(180,160,130,0.3)"
                strokeWidth="1"
              />
            </svg>

            {/* Closed envelope torn edge line */}
            {step >= 2 && (
              <div className="absolute top-[72px] left-0 right-0 flex justify-center items-center">
                <svg width="280" height="8" viewBox="0 0 280 8">
                  <path
                    d="M0 4 Q10 1, 20 4 T40 4 T60 4 T80 4 T100 4 T120 4 T140 4 T160 4 T180 4 T200 4 T220 4 T240 4 T260 4 T280 4"
                    fill="none"
                    stroke="rgba(180,160,130,0.35)"
                    strokeWidth="1"
                    strokeDasharray="6 3 2 3"
                  />
                </svg>
              </div>
            )}

            {/* Wax seal */}
            <div
              className="absolute top-[50px] left-1/2 -translate-x-1/2 transition-all duration-700"
              style={{
                transform: step >= 3
                  ? "translateX(-50%) scale(1)"
                  : "translateX(-50%) scale(1.8)",
                opacity: step >= 2 ? 1 : 0,
                transitionDelay: step >= 3 ? "0s" : "0.2s",
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center relative"
                style={{
                  background: "radial-gradient(circle at 35% 35%, #a04430, #8a3a2a)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.1)",
                  animation: step >= 3 ? "seal-pulse 3s ease-in-out infinite" : "none",
                }}
              >
                {/* Irregular edge simulation */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: "1.5px solid rgba(160,68,48,0.5)",
                    transform: "scale(1.05)",
                  }}
                />
                <span
                  className="font-serif font-bold text-paper text-sm relative z-10"
                  style={{ transform: "rotate(-3deg)" }}
                >
                  封
                </span>
              </div>
              {/* Stamp ripple effect */}
              {step === 3 && (
                <div
                  className="absolute inset-0 rounded-full border-2 border-amber/30"
                  style={{
                    animation: "ripple-out 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Step 4: Success text */}
        <div
          className="absolute bottom-16 left-0 right-0 text-center transition-all duration-700"
          style={{
            opacity: step >= 4 ? 1 : 0,
            transform: step >= 4 ? "translateY(0)" : "translateY(20px)",
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <p className="font-serif text-amber text-xl mb-2 inline-flex items-center justify-center gap-2">
            <IconEnvelope size={22} />
            信件已封存
          </p>
          <p className="font-sans text-warm-muted text-sm">
            AI 正在以&quot;未来的你&quot;的身份写回信...
          </p>
        </div>
      </div>

      {/* Ripple animation keyframes via style tag */}
      <style>{`
        @keyframes ripple-out {
          from { transform: scale(1); opacity: 0.6; }
          to { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
