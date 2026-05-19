import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Ticket, Sparkles, BarChart3, Users, Plus, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { initials } from "../lib/format";
import { RoleBadge } from "./Badge";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";

function NavItem({ to, icon: Icon, children, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-indigo-500/15 text-indigo-200"
            : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
        )
      }
    >
      <Icon className="h-4 w-4" />
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/tickets" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-100">AI Ticket Analyzer</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Powered by Gemini</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavItem to="/tickets" icon={Ticket} end>
            Tickets
          </NavItem>
          <NavItem to="/tickets/new" icon={Plus}>
            New
          </NavItem>
          {user.role === "admin" && (
            <>
              <NavItem to="/admin/agents" icon={Users}>
                Agents
              </NavItem>
              <NavItem to="/admin/stats" icon={BarChart3}>
                Stats
              </NavItem>
            </>
          )}
        </nav>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 transition hover:border-slate-700"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
              {initials(user.name)}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-xs font-medium text-slate-100">{user.name}</span>
              <span className="text-[10px] text-slate-500">{user.email}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl animate-fade-in">
              <div className="border-b border-slate-800 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white">
                    {initials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <RoleBadge value={user.role} />
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800/60"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden border-t border-slate-800 bg-slate-950/60">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-2 py-2">
          <NavItem to="/tickets" icon={Ticket} end>
            Tickets
          </NavItem>
          <NavItem to="/tickets/new" icon={Plus}>
            New
          </NavItem>
          {user.role === "admin" && (
            <>
              <NavItem to="/admin/agents" icon={Users}>
                Agents
              </NavItem>
              <NavItem to="/admin/stats" icon={BarChart3}>
                Stats
              </NavItem>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
