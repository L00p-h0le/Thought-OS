export function IdeaListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="tile p-4 h-28" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="tile p-4 flex items-center gap-4">
          <div className="skeleton h-5 w-20" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8"
      role="status"
      aria-label="Loading"
    >
      {children}
    </div>
  );
}
