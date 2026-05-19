import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Button from "../components/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800">
        <Compass className="h-6 w-6 text-slate-400" />
      </div>
      <h1 className="mt-6 text-3xl font-bold text-slate-100">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        We couldn't find what you were looking for. Head back to your tickets.
      </p>
      <Link to="/tickets" className="mt-6">
        <Button>Go to tickets</Button>
      </Link>
    </div>
  );
}
