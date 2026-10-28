"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MagnifyingGlass,
  X,
  Funnel,
  Lightning,
  Plus,
  ArrowClockwise,
  CurrencyDollar,
  Gauge,
} from "@phosphor-icons/react";
import { LEVEL_CSS, LEVEL_LABELS } from "@/lib/constants";
import type { Level } from "@/lib/constants";
import { StatusBadge } from "@/components/status-badge";
import { Segmented } from "@/components/segmented";

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

  // Sync state if URL searchParams change (e.g. browser back/forward or stat card click).
  // Adjusting state during render avoids a cascading effect re-render.
  const [prevSearchParams, setPrevSearchParams] = useState(searchParams);
  if (searchParams !== prevSearchParams) {
    setPrevSearchParams(searchParams);
    setQuery(searchParams.get("q") ?? "");
    setStatus(searchParams.get("status") ?? "ACTIVE");
    setCategory(searchParams.get("category") ?? "ALL");
    setSort(searchParams.get("sort") ?? "updated");
  }

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
      <div className="tile text-center py-16 px-6 animate-in">
        <div className="w-12 h-12 rounded-xl bg-surface-2 border border-line-strong flex items-center justify-center mx-auto mb-4">
          <Lightning weight="fill" className="w-6 h-6 text-accent" aria-hidden />
        </div>
        <h3 className="text-lg font-bold mb-1.5">No ideas yet</h3>
        <p className="text-sm text-fg-muted mb-6 max-w-sm mx-auto">
          Start capturing your ideas. Every great product started as a thought.
        </p>
        <Link href="/ideas/new" className="btn btn-primary">
          <Plus weight="bold" className="w-4 h-4" aria-hidden />
          Add your first idea
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
      {/* Toolbar */}
      <div className="tile p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <label htmlFor="idea-search" className="sr-only">
              Search ideas
            </label>
            <MagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted pointer-events-none"
              weight="bold"
              aria-hidden
            />
            <input
              id="idea-search"
              type="search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by title, summary or category"
              className="field pl-9 pr-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 btn btn-ghost btn-icon"
                aria-label="Clear search"
              >
                <X weight="bold" className="w-3.5 h-3.5" aria-hidden />
              </button>
            )}
          </div>

          <div className="flex gap-2.5">
            <label className="sr-only" htmlFor="idea-category">
              Category
            </label>
            <select
              id="idea-category"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="field sm:w-44"
            >
              <option value="ALL">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="idea-sort">
              Sort by
            </label>
            <select
              id="idea-sort"
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="field sm:w-44"
            >
              <option value="updated">Recently updated</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Alphabetical (A–Z)</option>
              <option value="tasks">Most tasks</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Filter by status"
            options={statusOptions}
            value={status}
            onChange={handleStatusChange}
            className="max-w-full"
          />
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-ghost btn-sm ml-auto"
            >
              <ArrowClockwise weight="bold" className="w-3.5 h-3.5" aria-hidden />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results summary */}
      <p className="text-xs text-fg-muted px-1" aria-live="polite">
        Showing <span className="text-fg font-semibold">{filteredIdeas.length}</span> of{" "}
        {ideas.length} ideas
        {status !== "ACTIVE" && (
          <> · {statusOptions.find((o) => o.id === status)?.label || status}</>
        )}
        {category !== "ALL" && <> · #{category}</>}
        {query && <> · matching &ldquo;{query}&rdquo;</>}
      </p>

      {filteredIdeas.length === 0 ? (
        <div className="tile text-center py-12 px-6 animate-in">
          <div className="w-11 h-11 rounded-xl bg-surface-2 border border-line flex items-center justify-center mx-auto mb-3 text-fg-muted">
            <Funnel weight="bold" className="w-5 h-5" aria-hidden />
          </div>
          <h3 className="text-base font-bold mb-1">No ideas match your filters</h3>
          <p className="text-sm text-fg-muted max-w-sm mx-auto mb-5">
            {query
              ? `Nothing matches "${query}". Try other keywords, or change the status or category.`
              : "Try selecting a different status or category."}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn btn-secondary btn-sm"
          >
            <ArrowClockwise weight="bold" className="w-3.5 h-3.5" aria-hidden />
            Clear all filters
          </button>
        </div>
      ) : (
        <ul className="space-y-2 stagger">
          {filteredIdeas.map((idea) => {
            const tasksDone = idea.tasks.filter((t) => t.status === "DONE").length;
            const totalIdTasks = idea.tasks.length;
            const progress =
              totalIdTasks > 0 ? (tasksDone / totalIdTasks) * 100 : 0;

            const isArchived = idea.status === "ARCHIVED";
            const feasibility = idea.analysis?.feasibility as Level | undefined;

            return (
              <li key={idea.id}>
                <Link
                  href={`/ideas/${idea.id}`}
                  className={`tile tile-interactive flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 ${
                    isArchived ? "opacity-70 hover:opacity-100" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={idea.status} />
                      <h3 className="text-[0.9375rem] font-semibold truncate min-w-0">
                        {idea.title}
                      </h3>
                      {idea.category && (
                        <span className="text-xs text-fg-muted font-mono">
                          #{idea.category}
                        </span>
                      )}
                    </div>
                    {idea.description && (
                      <p className="text-sm text-fg-muted truncate mt-1">
                        {idea.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {feasibility && feasibility in LEVEL_CSS && (
                      <span
                        className={`chip ${LEVEL_CSS[feasibility]}`}
                        title="Feasibility"
                      >
                        <Gauge weight="bold" className="w-3 h-3" aria-hidden />
                        <span className="sr-only">Feasibility:</span>
                        {LEVEL_LABELS[feasibility]}
                      </span>
                    )}

                    {idea.analysis?.canMonetize && (
                      <span className="chip tone-success" title="Monetizable">
                        <CurrencyDollar weight="bold" className="w-3 h-3" aria-hidden />
                        <span className="sr-only">Monetizable</span>
                      </span>
                    )}

                    <span className="flex items-center gap-2 sm:w-28">
                      <span className="progress-track flex-1 sm:w-16 block" aria-hidden>
                        <span
                          className="progress-fill block"
                          style={{ width: `${progress}%` }}
                        />
                      </span>
                      <span className="text-xs font-mono tabular-nums text-fg-muted">
                        {tasksDone}/{totalIdTasks}
                        <span className="sr-only"> tasks done</span>
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
