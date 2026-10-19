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
    <aside className="w-64 min-h-screen border-r border-border bg-surface flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Lightning weight="fill" className="w-4 h-4 text-accent" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">
            Ideas
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-default"
          >
            <Icon weight="regular" className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Recent Ideas */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-2.5 pb-2 text-xs font-mono uppercase tracking-wider text-muted/60">
          Recent
        </p>
        <div className="space-y-0.5">
          {ideas.length === 0 && (
            <p className="px-2.5 py-2 text-xs text-muted/40">No ideas yet</p>
          )}
          {ideas.map((idea) => {
            const StatusIcon =
              STATUS_ICONS[idea.status as keyof typeof STATUS_ICONS] || Lightbulb;
            return (
              <Link
                key={idea.id}
                href={`/ideas/${idea.id}`}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-default group"
              >
                <StatusIcon
                  weight="regular"
                  className="w-3.5 h-3.5 shrink-0 opacity-50 group-hover:opacity-100"
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
