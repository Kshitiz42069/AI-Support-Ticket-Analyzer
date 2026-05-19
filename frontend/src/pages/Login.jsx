import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sparkles, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiError } from "../api/client";
import Card from "../components/Card";
import Button from "../components/Button";
import { Input } from "../components/Input";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/tickets";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(apiError(err, "Login failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-100">AI Ticket Analyzer</h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to manage support tickets with AI-powered triage.
          </p>
        </div>

        <Card padding="lg">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-slate-100">Sign in</h2>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-slate-500" />
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-slate-500" />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" loading={submitting} className="mt-2 w-full">
              Sign in
            </Button>

            <p className="text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
                Create one
              </Link>
            </p>
          </form>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-600">
          Tickets are automatically classified by Google Gemini.
        </p>
      </div>
    </div>
  );
}
