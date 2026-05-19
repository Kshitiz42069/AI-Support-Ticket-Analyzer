import clsx from "clsx";
import Spinner from "./Spinner";

const variants = {
  primary:
    "bg-indigo-500 hover:bg-indigo-400 text-white shadow-md shadow-indigo-500/20 focus:ring-indigo-400",
  secondary:
    "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 focus:ring-slate-500",
  ghost:
    "bg-transparent hover:bg-slate-800/60 text-slate-300 focus:ring-slate-500",
  danger:
    "bg-red-500/90 hover:bg-red-500 text-white shadow-md shadow-red-500/20 focus:ring-red-400",
  outline:
    "bg-transparent hover:bg-slate-800/60 text-slate-100 border border-slate-700 focus:ring-slate-500",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  children,
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {loading && <Spinner size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}
