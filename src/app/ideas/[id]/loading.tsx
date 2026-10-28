import { PageSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <PageSkeleton>
      <div className="skeleton h-4 w-40 mb-8" />
      <div className="tile p-6 space-y-4">
        <div className="skeleton h-5 w-28" />
        <div className="skeleton h-8 w-2/3" />
        <div className="skeleton h-4 w-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6 mt-6">
        <div className="tile h-[28rem]" />
        <div className="tile h-80" />
      </div>
    </PageSkeleton>
  );
}
