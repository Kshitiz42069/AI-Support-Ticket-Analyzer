import clsx from "clsx";
import {
  AlertTriangle,
  Flame,
  CircleDot,
  Leaf,
  Circle,
  CircleDashed,
  CheckCircle2,
  Archive,
} from "lucide-react";

const PRIORITY = {
  critical: { label: "Critical", icon: AlertTriangle, classes: "bg-red-500/10 text-red-300 border-red-500/30" },
  high: { label: "High", icon: Flame, classes: "bg-orange-500/10 text-orange-300 border-orange-500/30" },
  medium: { label: "Medium", icon: CircleDot, classes: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  low: { label: "Low", icon: Leaf, classes: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
};

const STATUS = {
  open: { label: "Open", icon: Circle, classes: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
  "in-progress": { label: "In Progress", icon: CircleDashed, classes: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30" },
  resolved: { label: "Resolved", icon: CheckCircle2, classes: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  closed: { label: "Closed", icon: Archive, classes: "bg-slate-500/10 text-slate-300 border-slate-500/30" },
};

export function PriorityBadge({ value, size = "md" }) {
  const config = PRIORITY[value] || PRIORITY.medium;
  const Icon = config.icon;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        config.classes,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

export function StatusBadge({ value, size = "md" }) {
  const config = STATUS[value] || STATUS.open;
  const Icon = config.icon;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        config.classes,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

export function RoleBadge({ value }) {
  const colors = {
    admin: "bg-violet-500/10 text-violet-300 border-violet-500/30",
    agent: "bg-sky-500/10 text-sky-300 border-sky-500/30",
    customer: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
        colors[value] || colors.customer
      )}
    >
      {value}
    </span>
  );
}

export function Tag({ children }) {
  return (
    <span className="inline-flex items-center rounded-md border border-slate-700/60 bg-slate-800/40 px-2 py-0.5 text-xs text-slate-300">
      {children}
    </span>
  );
}

export const PRIORITY_VALUES = Object.keys(PRIORITY);
export const STATUS_VALUES = Object.keys(STATUS);
