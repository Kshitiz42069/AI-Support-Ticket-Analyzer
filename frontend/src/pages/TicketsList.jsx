import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Inbox, ChevronLeft, ChevronRight, X, Filter } from "lucide-react";
import { listTickets } from "../api/tickets";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiError } from "../api/client";
import { PriorityBadge, StatusBadge, Tag, PRIORITY_VALUES, STATUS_VALUES } from "../components/Badge";
import Card from "../components/Card";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import { formatRelative } from "../lib/format";

const PAGE_SIZE = 10;

export default function TicketsList() {
  const { user } = useAuth();
  const toast = useToast();

  const [filters, setFilters] = useState({ status: "", priority: "", tag: "" });
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listTickets({
        ...filters,
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
      });
      setData(res);
    } catch (err) {
      toast.error(apiError(err, "Failed to load tickets"));
    } finally {
      setLoading(false);
    }
  }, [filters, page, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function updateFilter(key, value) {
    setPage(0);
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function clearFilters() {
    setPage(0);
    setFilters({ status: "", priority: "", tag: "" });
  }

  const hasFilters = filters.status || filters.priority || filters.tag;
  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  const heading = {
    customer: "My tickets",
    agent: "Assigned to me",
    admin: "All tickets",
  }[user.role];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{heading}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {data.total} {data.total === 1 ? "ticket" : "tickets"}
            {hasFilters ? " matching your filters" : ""}
          </p>
        </div>
        <Link to="/tickets/new">
          <Button>
            <Plus className="h-4 w-4" /> New ticket
          </Button>
        </Link>
      </div>

      <Card padding="sm" className="!p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 text-xs uppercase tracking-wider text-slate-500">
            <Filter className="h-3.5 w-3.5" /> Filter
          </div>
          <FilterChips
            label="Status"
            value={filters.status}
            options={STATUS_VALUES}
            onChange={(v) => updateFilter("status", v)}
          />
          <FilterChips
            label="Priority"
            value={filters.priority}
            options={PRIORITY_VALUES}
            onChange={(v) => updateFilter("priority", v)}
          />
          <TagFilter value={filters.tag} onChange={(v) => updateFilter("tag", v)} />
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : data.items.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={Inbox}
              title={hasFilters ? "No tickets match these filters" : "No tickets yet"}
              message={
                hasFilters
                  ? "Try clearing filters or adjusting them to see more results."
                  : user.role === "customer"
                    ? "File your first ticket and let AI handle the triage."
                    : "Nothing in your queue right now."
              }
              action={
                user.role === "customer" && !hasFilters ? (
                  <Link to="/tickets/new">
                    <Button>
                      <Plus className="h-4 w-4" /> New ticket
                    </Button>
                  </Link>
                ) : null
              }
            />
          </Card>
        ) : (
          data.items.map((t) => <TicketRow key={t._id} ticket={t} />)
        )}
      </div>

      {data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-slate-800/60 pt-4">
          <p className="text-sm text-slate-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChips({ label, value, options, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-xs text-slate-500 pl-1">{label}:</span>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(active ? "" : opt)}
            className={
              "rounded-full border px-2.5 py-0.5 text-xs capitalize transition " +
              (active
                ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-200"
                : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-200")
            }
          >
            {opt.replace("-", " ")}
          </button>
        );
      })}
    </div>
  );
}

function TagFilter({ value, onChange }) {
  const [draft, setDraft] = useState(value || "");
  useEffect(() => setDraft(value || ""), [value]);

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-500 pl-1">Tag:</span>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onChange(draft.trim());
        }}
        onBlur={() => onChange(draft.trim())}
        placeholder="e.g. login"
        className="w-28 rounded-full border border-slate-700 bg-slate-800/40 px-2.5 py-0.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500/40 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
      />
    </div>
  );
}

function TicketRow({ ticket }) {
  return (
    <Link to={`/tickets/${ticket._id}`} className="block">
      <Card className="transition hover:border-slate-700 hover:bg-slate-900/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-slate-100">{ticket.title}</h3>
              <PriorityBadge value={ticket.priority} size="sm" />
              <StatusBadge value={ticket.status} size="sm" />
            </div>
            <p className="mt-1.5 line-clamp-2 text-sm text-slate-400">{ticket.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {(ticket.tags || []).slice(0, 4).map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
              {(ticket.tags || []).length > 4 && (
                <span className="text-xs text-slate-500">+{ticket.tags.length - 4}</span>
              )}
            </div>
          </div>
          <div className="text-xs text-slate-500 sm:text-right shrink-0">
            <p>Created {formatRelative(ticket.createdAt)}</p>
            {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
              <p>Updated {formatRelative(ticket.updatedAt)}</p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="skeleton h-5 w-2/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
      </div>
    </Card>
  );
}
