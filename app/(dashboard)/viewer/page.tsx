import { HeroBanner } from "@/app/components/dashboard/HeroBanner";
import { ProjectFilters } from "@/app/components/dashboard/ProjectFilters";
import { FaqFab } from "@/app/components/ui/FaqFab";
import { InfiniteProjectFeed } from "@/app/components/dashboard/InfiniteProjectFeed";
import { getInfiniteProjects } from "@/lib/actions/project-feed";
import { getAllTerms, getActiveTerm } from "@/lib/actions/project";

export default async function ViewerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const q = resolvedParams?.q || "";
  const status = resolvedParams?.status || "all";
  const sort = resolvedParams?.sort || "newest";
  
  const [terms, currentActiveTerm] = await Promise.all([
    getAllTerms(),
    getActiveTerm()
  ]);

  const activeTermId = resolvedParams?.term || currentActiveTerm?.id || "";

  const { projects: initialProjects } = await getInfiniteProjects({
    page: 1,
    q,
    status,
    sort,
    termId: activeTermId
  });

  return (
    <main className="mx-auto px-4 lg:px-24 w-full flex-1 relative pb-24">
      <HeroBanner terms={terms} currentTermId={activeTermId} />

      <div className="mb-2 mt-4">
        <h1 className="text-2xl font-bold text-[#153B44]">Project Dashboard</h1>
        <p className="text-sm text-gray-500">
          Follow and engage in USSC Projects and Initiatives
        </p>
      </div>

      <ProjectFilters />

      <InfiniteProjectFeed
        initialProjects={initialProjects}
        userRole="viewer"
        searchParams={{ q, status, sort, termId: activeTermId }}
        followingOnly={false} 
      />

      <FaqFab />
    </main>
  );
}