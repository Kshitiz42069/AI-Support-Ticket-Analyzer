import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import clsx from "clsx";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, { type = "info", duration = 3500 } = {}) => {
      const id = ++idCounter;
      setToasts((curr) => [...curr, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const toast = {
    info: (m, o) => push(m, { ...o, type: "info" }),
    success: (m, o) => push(m, { ...o, type: "success" }),
    error: (m, o) => push(m, { ...o, type: "error" }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const config = {
    success: { icon: CheckCircle2, color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
    error: { icon: AlertCircle, color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" },
    info: { icon: Info, color: "text-sky-400", border: "border-sky-500/30", bg: "bg-sky-500/10" },
  }[toast.type];
  const Icon = config.icon;
  return (
    <div
      className={clsx(
        "flex items-start gap-3 rounded-lg border bg-slate-900/95 backdrop-blur-sm px-4 py-3 shadow-lg animate-fade-in",
        config.border,
        config.bg
      )}
    >
      <Icon className={clsx("h-5 w-5 mt-0.5 shrink-0", config.color)} />
      <p className="text-sm text-slate-100 flex-1">{toast.message}</p>
      <button onClick={onDismiss} className="text-slate-500 hover:text-slate-300 transition">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
