import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  Lightning,
  Lightbulb,
  House,
  Plus,
  Archive,
  Rocket,
  MagnifyingGlass,
  Hammer,
} from "@phosphor-icons/react/dist/ssr";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: House },
  { href: "/ideas/new", label: "New Idea", icon: Plus },
];

const STATUS_ICONS = {
  DRAFT: Lightbulb,
  EXPLORING: MagnifyingGlass,
  BUILDING: Hammer,
  LAUNCHED: Rocket,
  ARCHIVED: Archive,
} as const;

export async function Sidebar() {
  const ideas = await prisma.idea.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, status: true },
    take: 20,
  });

  return (
    <aside className="w-64 min-h-screen border-r border-white/10 bg-[#0c0f17] flex flex-col shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/25 to-teal-500/10 border border-emerald-500/40 shadow-[0_0_16px_rgba(16,185,129,0.3)] flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-default">
            <Lightning weight="fill" className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white group-hover:text-emerald-300 transition-default block">
              Thought-OS
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-400 font-semibold block">
              IDEAS ENGINE
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="px-3.5 py-4 space-y-1.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold tracking-tight text-slate-300 hover:text-white hover:bg-white/6 hover:border-white/10 border border-transparent transition-default group"
          >
            <Icon weight="bold" className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-emerald-400 transition-default" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Recent Ideas */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-4">
        <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-[0.16em] font-bold text-slate-400">
          Recent Ideas
        </p>
        <div className="space-y-1">
          {ideas.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-400">No ideas yet</p>
          )}
          {ideas.map((idea) => {
            const StatusIcon =
              STATUS_ICONS[idea.status as keyof typeof STATUS_ICONS] || Lightbulb;
            return (
              <Link
                key={idea.id}
                href={`/ideas/${idea.id}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/6 transition-default group"
              >
                <StatusIcon
                  weight="bold"
                  className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-emerald-400 transition-default"
                />
                <span className="truncate">{idea.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
