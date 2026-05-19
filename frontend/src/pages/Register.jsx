import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiError } from "../api/client";
import Card from "../components/Card";
import Button from "../components/Button";
import { Input, Select } from "../components/Input";

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [submitting, setSubmitting] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      toast.success("Account created");
      navigate("/tickets", { replace: true });
    } catch (err) {
      toast.error(apiError(err, "Registration failed"));
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
          <h1 className="mt-4 text-2xl font-bold text-slate-100">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">Start filing AI-classified tickets in seconds.</p>
        </div>

        <Card padding="lg">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-slate-100">Sign up</h2>

            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-slate-500" />
              <Input
                label="Full name"
                name="name"
                placeholder="Ada Lovelace"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                className="pl-9"
              />
            </div>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-slate-500" />
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                className="pl-9"
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-slate-500" />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                minLength={6}
                className="pl-9"
                autoComplete="new-password"
              />
            </div>

            <Select
              label="Role"
              name="role"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              hint="Pick the persona you want to test the app as."
            >
              <option value="customer">Customer — file tickets</option>
              <option value="agent">Agent — work assigned tickets</option>
              <option value="admin">Admin — full access and analytics</option>
            </Select>

            <Button type="submit" loading={submitting} className="mt-2 w-full">
              Create account
            </Button>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
                Sign in
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
