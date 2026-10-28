import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";

type Crumb = { label: string; href?: string };

type PageHeaderProps = {
  title?: string;
  description?: React.ReactNode;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <header className="mb-6 md:mb-8 animate-in">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex items-center gap-1.5 text-sm text-fg-muted min-w-0">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <li
                  key={i}
                  className={`flex items-center gap-1.5 ${isLast ? "min-w-0" : "shrink-0"}`}
                >
                  {i > 0 && (
                    <CaretRight weight="bold" className="w-3 h-3 shrink-0" aria-hidden />
                  )}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-fg transition-default font-medium"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={isLast ? "page" : undefined}
                      className="truncate text-fg-body font-medium"
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {(title || actions) && (
        <div className="flex flex-wrap items-end justify-between gap-4">
          {title && (
            <div className="min-w-0">
              <h1 className="text-[clamp(1.75rem,1.2rem+1.6vw,2.25rem)] font-bold">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-fg-muted mt-1.5">{description}</p>
              )}
            </div>
          )}
          {actions && (
            <div className="flex items-center gap-2 ml-auto">{actions}</div>
          )}
        </div>
      )}
    </header>
  );
}
