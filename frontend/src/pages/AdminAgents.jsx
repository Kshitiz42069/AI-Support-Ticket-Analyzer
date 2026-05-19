import { useEffect, useState } from "react";
import { Users, Mail, Calendar } from "lucide-react";
import { listAgents } from "../api/users";
import { useToast } from "../context/ToastContext";
import { apiError } from "../api/client";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { PageSpinner } from "../components/Spinner";
import { initials, formatRelative } from "../lib/format";

export default function AdminAgents() {
  const toast = useToast();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listAgents()
      .then((res) => !cancelled && setAgents(res))
      .catch((err) => toast.error(apiError(err, "Failed to load agents")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [toast]);

  if (loading) return <PageSpinner label="Loading agents…" />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Agents</h1>
        <p className="mt-1 text-sm text-slate-400">
          Support agents available for ticket assignment. {agents.length} total.
        </p>
      </div>

      {agents.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon={Users}
            title="No agents yet"
            message="Register a user with the 'agent' role to staff your queue."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <Card key={a._id} padding="md" className="transition hover:border-slate-700">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/20">
                  {initials(a.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-100">{a.name}</h3>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-400">
                    <Mail className="h-3 w-3" /> {a.email}
                  </p>
                  {a.created_at && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" /> Joined {formatRelative(a.created_at)}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
