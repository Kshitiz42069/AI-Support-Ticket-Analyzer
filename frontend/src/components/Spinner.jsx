import clsx from "clsx";
import { Loader2 } from "lucide-react";

export default function Spinner({ size = 20, className }) {
  return <Loader2 className={clsx("animate-spin", className)} style={{ width: size, height: size }} />;
}

export function PageSpinner({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
      <Spinner size={28} className="text-indigo-400" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
