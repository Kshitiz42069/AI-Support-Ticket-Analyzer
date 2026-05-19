import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-600">
        AI Ticket Analyzer · FastAPI + Gemini + MongoDB
      </footer>
    </div>
  );
}
