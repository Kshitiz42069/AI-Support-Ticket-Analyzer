import clsx from "clsx";
import { forwardRef } from "react";

export const Input = forwardRef(function Input(
  { label, error, hint, className, id, ...rest },
  ref
) {
  const inputId = id || rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={clsx(
          "w-full rounded-lg bg-slate-900/60 border px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition outline-none",
          "focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60",
          error
            ? "border-red-500/50"
            : "border-slate-700 hover:border-slate-600",
          className
        )}
        {...rest}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

export const TextArea = forwardRef(function TextArea(
  { label, error, hint, className, id, rows = 5, ...rest },
  ref
) {
  const inputId = id || rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={clsx(
          "w-full rounded-lg bg-slate-900/60 border px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition outline-none resize-y",
          "focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60",
          error
            ? "border-red-500/50"
            : "border-slate-700 hover:border-slate-600",
          className
        )}
        {...rest}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

export const Select = forwardRef(function Select(
  { label, error, hint, className, id, children, ...rest },
  ref
) {
  const inputId = id || rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        className={clsx(
          "w-full rounded-lg bg-slate-900/60 border px-3 py-2.5 text-sm text-slate-100 transition outline-none",
          "focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60",
          error
            ? "border-red-500/50"
            : "border-slate-700 hover:border-slate-600",
          className
        )}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
});
