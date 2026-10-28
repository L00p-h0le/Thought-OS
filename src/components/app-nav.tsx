"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lightning, House, Plus, List, X } from "@phosphor-icons/react";
import { STATUS_ICONS } from "@/lib/status-icons";
import { STATUS_LABELS, type IdeaStatus } from "@/lib/constants";
import { ThemeToggle } from "@/components/theme-toggle";

type RecentIdea = { id: string; title: string; status: string };

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: House },
  { href: "/ideas/new", label: "New Idea", icon: Plus },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-lg">
      <span className="w-8 h-8 rounded-lg bg-surface-2 border border-line-strong flex items-center justify-center">
        <Lightning weight="fill" className="w-4 h-4 text-accent" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block font-bold tracking-tight text-fg">Thought-OS</span>
        <span className="block eyebrow text-[0.625rem]">Ideas engine</span>
      </span>
    </Link>
  );
}

function NavContent({ pathname }: { pathname: string }) {
  return (
      <nav aria-label="Primary" className="px-3 py-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-3 px-3 min-h-10 rounded-lg text-sm font-semibold transition-default ${
                    active
                      ? "bg-surface-2 text-fg"
                      : "text-fg-muted hover:text-fg hover:bg-surface-2"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-accent"
                    />
                  )}
                  <Icon weight="bold" className="w-4 h-4 shrink-0" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
  );
}

function RecentList({ ideas, pathname }: { ideas: RecentIdea[]; pathname: string }) {
  return (
    <nav aria-label="Recent ideas" className="flex-1 overflow-y-auto px-3 pb-4 min-h-0">
      <p className="eyebrow px-3 pb-2">Recent</p>
      {ideas.length === 0 ? (
        <p className="px-3 py-2 text-xs text-fg-muted">No ideas yet</p>
      ) : (
        <ul className="space-y-0.5">
          {ideas.map((idea) => {
            const href = `/ideas/${idea.id}`;
            const active = pathname === href;
            const status = (idea.status in STATUS_ICONS ? idea.status : "DRAFT") as IdeaStatus;
            const StatusIcon = STATUS_ICONS[status];
            return (
              <li key={idea.id}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2.5 px-3 min-h-9 rounded-lg text-[0.8125rem] font-medium transition-default ${
                    active
                      ? "bg-surface-2 text-fg"
                      : "text-fg-body hover:text-fg hover:bg-surface-2"
                  }`}
                >
                  <StatusIcon
                    weight="bold"
                    className="w-3.5 h-3.5 shrink-0 text-fg-muted"
                    aria-label={STATUS_LABELS[status]}
                  />
                  <span className="truncate">{idea.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}

function SidebarBody({ ideas, pathname }: { ideas: RecentIdea[]; pathname: string }) {
  return (
    <>
      <NavContent pathname={pathname} />
      <RecentList ideas={ideas} pathname={pathname} />
      <div className="border-t border-line p-3">
        <ThemeToggle />
      </div>
    </>
  );
}

export function AppNav({ recentIdeas }: { recentIdeas: RecentIdea[] }) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDialogElement>(null);

  const openDrawer = () => drawerRef.current?.showModal();
  const closeDrawer = () => drawerRef.current?.close();

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <aside className="hidden md:flex sticky top-0 h-dvh flex-col border-r border-line bg-surface">
        <div className="px-5 h-16 flex items-center border-b border-line shrink-0">
          <Brand />
        </div>
        <SidebarBody ideas={recentIdeas} pathname={pathname} />
      </aside>

      {/* Mobile: slim top bar + drawer */}
      <header className="md:hidden sticky top-0 z-40 h-14 px-4 flex items-center gap-3 border-b border-line bg-surface/90 backdrop-blur">
        <button
          type="button"
          onClick={openDrawer}
          aria-label="Menu"
          aria-controls="mobile-drawer"
          aria-haspopup="dialog"
          className="btn btn-ghost btn-icon -ml-2"
        >
          <List weight="bold" className="w-5 h-5" aria-hidden />
        </button>
        <Brand />
        <Link href="/ideas/new" className="btn btn-primary btn-sm ml-auto">
          <Plus weight="bold" className="w-4 h-4" aria-hidden />
          New
        </Link>
      </header>

      <dialog
        id="mobile-drawer"
        ref={drawerRef}
        aria-label="Navigation"
        className="drawer md:hidden"
        onClick={(e) => {
          // Close on backdrop click or after following any link.
          if (e.target === e.currentTarget || (e.target as HTMLElement).closest("a")) {
            closeDrawer();
          }
        }}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 h-14 flex items-center justify-between border-b border-line shrink-0">
            <Brand />
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close menu"
              className="btn btn-ghost btn-icon -mr-2"
            >
              <X weight="bold" className="w-5 h-5" aria-hidden />
            </button>
          </div>
          <SidebarBody ideas={recentIdeas} pathname={pathname} />
        </div>
      </dialog>
    </>
  );
}
