import { HeroBanner } from "@/app/components/dashboard/HeroBanner";
import { ProjectFilters } from "@/app/components/dashboard/ProjectFilters";
import { FaqFab } from "@/app/components/ui/FaqFab";
import { InfiniteProjectFeed } from "@/app/components/dashboard/InfiniteProjectFeed";
import { getAllTerms, getActiveTerm } from "@/lib/actions/project";

export default async function ViewerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const [terms, currentActiveTerm] = await Promise.all([
    getAllTerms(),
    getActiveTerm()
  ]);

  const activeTermId = resolvedParams?.term || currentActiveTerm?.id || "";

  return (
    <main className="mx-auto px-4 lg:px-24 w-full flex-1 relative pb-24">
      <HeroBanner terms={terms} currentTermId={activeTermId} />

      <div className="mb-2 mt-4">
        <h1 className="text-2xl font-bold text-[#153B44]">Project Dashboard</h1>
        <p className="text-sm text-gray-500">
          Follow and engage in USSC Projects and Initiatives
        </p>
      </div>

      <ProjectFilters termId={activeTermId}/>

      <InfiniteProjectFeed
        userRole="viewer"
        followingOnly={false} 
        termId={activeTermId}
      />

      <FaqFab />
    </main>
  );
}