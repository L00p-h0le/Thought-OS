import Link from "next/link";
import { Compass, ArrowLeft, Plus } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <div className="min-h-[80dvh] flex items-center justify-center px-4 py-10">
      <div className="tile p-8 md:p-10 max-w-md w-full text-center animate-in">
        <span className="icon-badge w-14 h-14 mx-auto mb-5">
          <Compass weight="bold" className="w-7 h-7" aria-hidden />
        </span>

        <p className="eyebrow">Error 404</p>
        <h1 className="text-2xl font-bold mt-2 mb-2">Idea not found</h1>
        <p className="text-sm text-fg-muted mb-8 max-w-xs mx-auto">
          The idea or page you&apos;re looking for doesn&apos;t exist, was removed, or the
          link is broken.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 justify-center">
          <Link href="/" className="btn btn-primary">
            <ArrowLeft weight="bold" className="w-4 h-4" aria-hidden />
            Back to dashboard
          </Link>
          <Link href="/ideas/new" className="btn btn-secondary">
            <Plus weight="bold" className="w-4 h-4" aria-hidden />
            New idea
          </Link>
        </div>
      </div>
    </div>
  );
}
