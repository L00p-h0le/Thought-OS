import Link from "next/link";
import { Compass, ArrowLeft, Plus } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="glass-card rounded-3xl p-10 max-w-md w-full text-center border border-white/12 shadow-2xl relative overflow-hidden animate-in">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/5 border border-emerald-500/35 shadow-[0_0_32px_rgba(16,185,129,0.25)] flex items-center justify-center mx-auto mb-5 text-emerald-400">
          <Compass weight="duotone" className="w-8 h-8" />
        </div>

        {/* Text */}
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
          Error 404
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-white mt-4 mb-2">
          Idea Not Found
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-xs mx-auto">
          The idea or page you are looking for does not exist, has been removed, or the link is broken.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl btn-accent text-sm font-bold tracking-tight transition-default active:scale-[0.98]"
          >
            <ArrowLeft weight="bold" className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Link
            href="/ideas/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 text-sm font-semibold tracking-tight text-slate-300 hover:text-white transition-default"
          >
            <Plus weight="bold" className="w-4 h-4" />
            New Idea
          </Link>
        </div>
      </div>
    </div>
  );
}
