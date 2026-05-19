import clsx from "clsx";

export default function Card({ className, children, padding = "md", ...rest }) {
  const pad = { none: "", sm: "p-4", md: "p-6", lg: "p-8" }[padding];
  return (
    <div
      className={clsx(
        "rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm shadow-xl shadow-black/20",
        pad,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
