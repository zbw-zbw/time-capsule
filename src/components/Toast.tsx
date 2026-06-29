"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

/* ---------- types ---------- */
type ToastType = "success" | "info" | "error";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
  exiting: boolean;
}

/* ---------- reducer ---------- */
type Action =
  | { type: "ADD"; toast: ToastItem }
  | { type: "REMOVE"; id: number }
  | { type: "EXIT"; id: number }
  | { type: "CLEAR" };

const MAX_TOASTS = 3;

function reducer(state: ToastItem[], action: Action): ToastItem[] {
  switch (action.type) {
    case "ADD": {
      const next = [...state];
      // 如果超出上限，标记最旧的为 exiting
      while (next.length >= MAX_TOASTS) {
        next[0].exiting = true;
        break; // 一次只退出一个，剩下的下次再处理
      }
      next.push(action.toast);
      return next;
    }
    case "EXIT":
      return state.map((t) => (t.id === action.id ? { ...t, exiting: true } : t));
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    case "CLEAR":
      return state.map((t) => ({ ...t, exiting: true }));
    default:
      return state;
  }
}

/* ---------- context ---------- */
interface ToastCtx {
  success: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastCtx | null>(null);

export function useToast(): ToastCtx {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/* ---------- color map ---------- */
const TYPE_COLORS: Record<ToastType, string> = {
  success: "#d4a574",
  info: "#a89888",
  error: "#c46a4a",
};

/* ---------- provider ---------- */
let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, []);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const removeAfterAnimation = useCallback((id: number) => {
    dispatch({ type: "EXIT", id });
    // 等 300ms 动画结束后真正移除
    const t = setTimeout(() => {
      dispatch({ type: "REMOVE", id });
      timersRef.current.delete(id);
    }, 300);
    timersRef.current.set(id, t);
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration: number = 3000) => {
      const id = ++idCounter;
      dispatch({ type: "ADD", toast: { id, message, type, duration, exiting: false } });

      // 定时移除
      const autoTimer = setTimeout(() => {
        removeAfterAnimation(id);
      }, duration);
      timersRef.current.set(id, autoTimer);
    },
    [removeAfterAnimation],
  );

  const ctxValue: ToastCtx = {
    success: (msg, dur) => addToast("success", msg, dur),
    info: (msg, dur) => addToast("info", msg, dur),
    error: (msg, dur) => addToast("error", msg, dur),
  };

  // 清理 timers
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={ctxValue}>
      {children}

      {/* Toast container */}
      <div
        className="fixed top-20 left-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none"
        style={{ transform: "translateX(-50%)", width: "100%", maxWidth: "480px", padding: "0 16px" }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            aria-live="assertive"
            onClick={() => removeAfterAnimation(toast.id)}
            className="pointer-events-auto cursor-pointer select-none"
            style={{
              width: "100%",
              borderRadius: "8px",
              background: "#231e19",
              border: "1px solid rgba(212,165,116,0.2)",
              boxShadow: `0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(212,165,116,0.08)`,
              overflow: "hidden",
              opacity: toast.exiting ? 0 : 1,
              transform: toast.exiting ? "translateY(-20px)" : "translateY(0)",
              transition: "opacity 0.3s cubic-bezier(0.22,1,0.36,1), transform 0.3s cubic-bezier(0.22,1,0.36,1)",
              animation: toast.exiting ? "none" : "toast-in 0.35s cubic-bezier(0.22,1,0.36,1) forwards",
            }}
          >
            <div className="flex items-start gap-0">
              {/* 左侧竖线 */}
              <div
                style={{
                  width: "3px",
                  minHeight: "100%",
                  backgroundColor: TYPE_COLORS[toast.type],
                  flexShrink: 0,
                  borderRadius: "3px 0 0 3px",
                }}
              />
              {/* 内容 */}
              <div className="flex-1 px-4 py-3">
                <p className="font-sans text-sm leading-relaxed" style={{ color: "#e8ddd0" }}>
                  {toast.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 入场动画 keyframes */}
      <style>{`
        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
