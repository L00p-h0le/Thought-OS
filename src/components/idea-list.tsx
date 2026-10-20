"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MagnifyingGlass,
  X,
  ArrowsDownUp,
  Tag,
  Funnel,
  Lightning,
  Plus,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { STATUS_LABELS, STATUS_CSS, LEVEL_CSS } from "@/lib/constants";
import type { IdeaStatus, Level } from "@/lib/constants";

export interface SerializedIdea {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  analysis: {
    feasibility: string;
    scalability: string;
    canMonetize: boolean;
  } | null;
  tasks: {
    status: string;
  }[];
}

interface IdeaListProps {
  ideas: SerializedIdea[];
  initialQuery?: string;
  initialStatus?: string;
  initialCategory?: string;
  initialSort?: string;
}

export function IdeaList({
  ideas,
  initialQuery = "",
  initialStatus = "ACTIVE",
  initialCategory = "ALL",
  initialSort = "updated",
}: IdeaListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL search params if present, else fallback to props
  const paramQuery = searchParams.get("q") ?? initialQuery;
  const paramStatus = searchParams.get("status") ?? initialStatus;
  const paramCategory = searchParams.get("category") ?? initialCategory;
  const paramSort = searchParams.get("sort") ?? initialSort;

  const [query, setQuery] = useState(paramQuery);
  const [status, setStatus] = useState(paramStatus);
  const [category, setCategory] = useState(paramCategory);
  const [sort, setSort] = useState(paramSort);

  // Sync state if URL searchParams change (e.g. browser back/forward or stat card click)
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const s = searchParams.get("status") ?? "ACTIVE";
    const c = searchParams.get("category") ?? "ALL";
    const srt = searchParams.get("sort") ?? "updated";

    setQuery(q);
    setStatus(s);
    setCategory(c);
    setSort(srt);
  }, [searchParams]);

  // Sync state changes to browser URL without re-rendering server components
  const updateUrl = (
    newQuery: string,
    newStatus: string,
    newCat: string,
    newSort: string
  ) => {
    const params = new URLSearchParams();
    if (newQuery.trim()) params.set("q", newQuery.trim());
    if (newStatus && newStatus !== "ACTIVE") params.set("status", newStatus);
    if (newCat && newCat !== "ALL") params.set("category", newCat);
    if (newSort && newSort !== "updated") params.set("sort", newSort);

    const qs = params.toString();
    const newUrl = qs ? `/?${qs}` : "/";
    window.history.replaceState(null, "", newUrl);
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    updateUrl(val, status, category, sort);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    updateUrl(query, val, category, sort);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    updateUrl(query, status, val, sort);
  };

  const handleSortChange = (val: string) => {
    setSort(val);
    updateUrl(query, status, category, val);
  };

  const handleResetFilters = () => {
    setQuery("");
    setStatus("ACTIVE");
    setCategory("ALL");
    setSort("updated");
    window.history.replaceState(null, "", "/");
  };

  const isFiltered =
    query.trim() !== "" ||
    status !== "ACTIVE" ||
    category !== "ALL" ||
    sort !== "updated";

  // Extract distinct non-empty categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    ideas.forEach((i) => {
      if (i.category && i.category.trim()) {
        set.add(i.category.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [ideas]);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = {
      ACTIVE: 0,
      ALL: ideas.length,
      DRAFT: 0,
      EXPLORING: 0,
      BUILDING: 0,
      LAUNCHED: 0,
      ARCHIVED: 0,
    };
    ideas.forEach((idea) => {
      if (idea.status !== "ARCHIVED") {
        counts.ACTIVE++;
      }
      if (idea.status in counts) {
        counts[idea.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [ideas]);

  // Filter and sort ideas
  const filteredIdeas = useMemo(() => {
    return ideas
      .filter((idea) => {
        // Status filter
        if (status === "ACTIVE") {
          if (idea.status === "ARCHIVED") return false;
        } else if (status !== "ALL") {
          if (idea.status !== status) return false;
        }

        // Category filter
        if (category !== "ALL") {
          if (idea.category?.trim() !== category) return false;
        }

        // Search query
        if (query.trim()) {
          const q = query.toLowerCase().trim();
          const titleMatch = idea.title.toLowerCase().includes(q);
          const descMatch = idea.description?.toLowerCase().includes(q);
          const catMatch = idea.category?.toLowerCase().includes(q);
          if (!titleMatch && !descMatch && !catMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sort === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sort === "title") {
          return a.title.localeCompare(b.title);
        }
        if (sort === "tasks") {
          return b.tasks.length - a.tasks.length;
        }
        // default "updated"
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [ideas, query, status, category, sort]);

  // Zero ideas total in DB
  if (ideas.length === 0) {
    return (
      <div className="text-center py-20 px-6 glass-card rounded-3xl border border-white/12 relative overflow-hidden animate-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 border border-emerald-500/35 shadow-[0_0_32px_rgba(16,185,129,0.25)] flex items-center justify-center mx-auto mb-4 text-emerald-400">
          <Lightning weight="fill" className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">
          No ideas yet
        </h2>
        <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto leading-relaxed">
          Start capturing your ideas. Every great product started as a thought.
        </p>
        <Link
          href="/ideas/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-accent text-sm font-bold tracking-tight transition-default active:scale-[0.98]"
        >
          <Plus weight="bold" className="w-4 h-4" />
          Add Your First Idea
        </Link>
      </div>
    );
  }

  const statusOptions = [
    { id: "ACTIVE", label: "Active", count: statusCounts.ACTIVE },
    { id: "BUILDING", label: "Building", count: statusCounts.BUILDING },
    { id: "EXPLORING", label: "Exploring", count: statusCounts.EXPLORING },
    { id: "LAUNCHED", label: "Launched", count: statusCounts.LAUNCHED },
    { id: "DRAFT", label: "Draft", count: statusCounts.DRAFT },
    { id: "ARCHIVED", label: "Archived", count: statusCounts.ARCHIVED },
    { id: "ALL", label: "All", count: statusCounts.ALL },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Control Bar */}
      <div className="glass-card rounded-2xl p-4 space-y-3.5 border border-white/10">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <MagnifyingGlass
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              weight="bold"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search ideas by title, summary, or category..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 text-sm focus-ring transition-default"
            />
            {query && (
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded transition-default cursor-pointer"
                title="Clear search"
              >
                <X weight="bold" className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative min-w-[170px]">
            <Tag
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              weight="bold"
            />
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-200 text-sm focus-ring appearance-none transition-default cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">
              ▼
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative min-w-[170px]">
            <ArrowsDownUp
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              weight="bold"
            />
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-200 text-sm focus-ring appearance-none transition-default cursor-pointer"
            >
              <option value="updated">Recently Updated</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical (A-Z)</option>
              <option value="tasks">Most Tasks</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Status Filter Tabs & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-1.5">
            {statusOptions.map((opt) => {
              const active = status === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleStatusChange(opt.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-default cursor-pointer ${
                    active
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      active
                        ? "bg-emerald-500/30 text-emerald-200"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {opt.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Reset Filters button if active */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-amber-300 rounded hover:bg-amber-500/10 transition-default cursor-pointer ml-auto"
              title="Reset all filters"
            >
              <ArrowClockwise weight="bold" className="w-3.5 h-3.5" />
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-slate-400 font-mono tracking-wide">
          Showing <span className="text-white font-bold">{filteredIdeas.length}</span>{" "}
          of <span className="text-slate-300">{ideas.length}</span> ideas
          {status !== "ACTIVE" && (
            <span className="text-emerald-400 ml-1.5 font-medium">
              ({statusOptions.find((o) => o.id === status)?.label || status})
            </span>
          )}
          {category !== "ALL" && (
            <span className="text-teal-400 ml-1.5 font-medium">
              [#{category}]
            </span>
          )}
          {query && (
            <span className="text-amber-400 ml-1.5">
              matching &quot;{query}&quot;
            </span>
          )}
        </p>
      </div>

      {/* Ideas List or Empty Search State */}
      {filteredIdeas.length === 0 ? (
        <div className="text-center py-16 px-6 glass-card rounded-2xl border border-white/10 animate-in">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Funnel weight="duotone" className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            No ideas match your filters
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">
            {query
              ? `No ideas found matching "${query}". Try adjusting keywords, changing status, or clearing filters.`
              : "No ideas found with current filters. Try selecting a different status or category."}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold tracking-tight border border-white/15 transition-default cursor-pointer"
          >
            <ArrowClockwise weight="bold" className="w-3.5 h-3.5" />
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-2 stagger">
          {filteredIdeas.map((idea) => {
            const tasksDone = idea.tasks.filter((t) => t.status === "DONE").length;
            const totalIdTasks = idea.tasks.length;
            const progress =
              totalIdTasks > 0 ? (tasksDone / totalIdTasks) * 100 : 0;

            const isArchived = idea.status === "ARCHIVED";

            return (
              <Link
                key={idea.id}
                href={`/ideas/${idea.id}`}
                className={`flex items-center gap-4 glass-card glass-card-hover rounded-xl p-4 transition-default group ${
                  isArchived ? "opacity-75 hover:opacity-100" : ""
                }`}
              >
                {/* Status badge */}
                <span
                  className={`shrink-0 px-3 py-1 rounded-md text-xs font-semibold font-mono tracking-wide ${
                    STATUS_CSS[idea.status as IdeaStatus] || "status-draft"
                  }`}
                >
                  {STATUS_LABELS[idea.status as IdeaStatus] || idea.status}
                </span>

                {/* Title + category + desc */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold tracking-tight text-slate-200 group-hover:text-white transition-default truncate">
                      {idea.title}
                    </h3>
                    {idea.category && (
                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-medium text-slate-400 bg-white/5 border border-white/5">
                        #{idea.category}
                      </span>
                    )}
                  </div>
                  {idea.description && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {idea.description}
                    </p>
                  )}
                </div>

                {/* Indicators */}
                <div className="flex items-center gap-3 shrink-0">
                  {idea.analysis && (
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold ${
                        LEVEL_CSS[idea.analysis.feasibility as Level] || ""
                      }`}
                    >
                      {idea.analysis.feasibility}
                    </span>
                  )}

                  {idea.analysis?.canMonetize && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                      $
                    </span>
                  )}

                  {/* Task progress */}
                  {totalIdTasks > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono tabular-nums text-slate-400 font-semibold">
                        {tasksDone}/{totalIdTasks}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">
                      0 tasks
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
