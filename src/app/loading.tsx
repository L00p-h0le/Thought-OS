import { IdeaListSkeleton, PageSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <PageSkeleton>
      <div className="skeleton h-9 w-48 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="tile col-span-2 lg:row-span-2 h-72" />
        <div className="tile col-span-2 h-36" />
        <div className="tile h-32" />
        <div className="tile h-32" />
      </div>
      <IdeaListSkeleton />
    </PageSkeleton>
  );
}
