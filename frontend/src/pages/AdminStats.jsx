import { useEffect, useState } from "react";
import { BarChart3, Ticket, TrendingUp, Tag as TagIcon } from "lucide-react";
import { getStats } from "../api/tickets";
import { useToast } from "../context/ToastContext";
import { apiError } from "../api/client";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { PageSpinner } from "../components/Spinner";
import { PriorityBadge, StatusBadge } from "../components/Badge";

export default function AdminStats() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getStats()
      .then((res) => !cancelled && setStats(res))
      .catch((err) => toast.error(apiError(err, "Failed to load stats")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [toast]);

  if (loading) return <PageSpinner label="Crunching numbers…" />;
  if (!stats) return null;

  const openCount = stats.by_status?.open || 0;
  const inProgressCount = stats.by_status?.["in-progress"] || 0;
  const criticalCount = stats.by_priority?.critical || 0;
  const topTag = stats.top_tags?.[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
        <p className="mt-1 text-sm text-slate-400">
          Aggregate metrics across every ticket in the system.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Ticket}
          label="Total tickets"
          value={stats.total}
          gradient="from-indigo-500 to-violet-500"
        />
        <StatCard
          icon={BarChart3}
          label="Open"
          value={openCount}
          gradient="from-sky-500 to-cyan-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Critical"
          value={criticalCount}
          gradient="from-red-500 to-orange-500"
        />
        <StatCard
          icon={TagIcon}
          label="Top tag"
          value={topTag?.tag || "—"}
          sub={topTag ? `${topTag.count} tickets` : null}
          gradient="from-emerald-500 to-teal-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100">By status</h2>
            <span className="text-xs text-slate-500">{stats.total} total</span>
          </div>
          {Object.keys(stats.by_status || {}).length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No data"
              message="Create a few tickets to see the status breakdown."
            />
          ) : (
            <DistributionBars
              data={stats.by_status}
              total={stats.total}
              renderLabel={(k) => <StatusBadge value={k} size="sm" />}
            />
          )}
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100">By priority</h2>
            <span className="text-xs text-slate-500">{stats.total} total</span>
          </div>
          {Object.keys(stats.by_priority || {}).length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No data"
              message="Tickets will appear here once classified."
            />
          ) : (
            <DistributionBars
              data={stats.by_priority}
              total={stats.total}
              renderLabel={(k) => <PriorityBadge value={k} size="sm" />}
            />
          )}
        </Card>
      </div>

      <Card padding="lg">
        <h2 className="text-base font-semibold text-slate-100">Top tags</h2>
        <p className="mt-1 text-sm text-slate-400">
          Most frequent topics across all tickets.
        </p>
        {(stats.top_tags || []).length === 0 ? (
          <EmptyState
            icon={TagIcon}
            title="No tags yet"
            message="The AI hasn't tagged any tickets in this collection."
          />
        ) : (
          <ol className="mt-4 flex flex-col gap-2">
            {stats.top_tags.map((t, i) => {
              const max = stats.top_tags[0].count || 1;
              const pct = Math.max(6, (t.count / max) * 100);
              return (
                <li
                  key={t.tag}
                  className="flex items-center gap-3 rounded-lg border border-slate-800/80 bg-slate-900/40 px-3 py-2"
                >
                  <span className="w-6 shrink-0 text-xs font-semibold text-slate-500">
                    #{i + 1}
                  </span>
                  <span className="w-32 shrink-0 truncate text-sm font-medium text-slate-200">
                    {t.tag}
                  </span>
                  <div className="flex-1 overflow-hidden rounded-full bg-slate-800/60">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs font-medium text-slate-300">
                    {t.count}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, gradient }) {
  return (
    <Card padding="md" className="relative overflow-hidden">
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl`}
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </span>
        </div>
        <p className="mt-2 text-3xl font-bold text-slate-100">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
      </div>
    </Card>
  );
}

function DistributionBars({ data, total, renderLabel }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <ol className="mt-4 flex flex-col gap-3">
      {entries.map(([key, count]) => {
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <li key={key} className="flex items-center gap-3">
            <div className="w-28 shrink-0">{renderLabel(key)}</div>
            <div className="flex-1 overflow-hidden rounded-full bg-slate-800/60">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                style={{ width: `${Math.max(2, pct)}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-xs text-slate-400">
              {count} · {pct.toFixed(0)}%
            </span>
          </li>
        );
      })}
    </ol>
  );
}
