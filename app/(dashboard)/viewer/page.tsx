import { HeroBanner } from "@/app/components/dashboard/HeroBanner";
import { ProjectFilters } from "@/app/components/dashboard/ProjectFilters";
import { ProjectCard } from "@/app/components/dashboard/ProjectCard";
import { FaqFab } from "@/app/components/ui/FaqFab";
import { MOCK_PROJECTS } from "@/lib/constants/mock-data";
import { getFilteredAndSortedProjects } from "@/lib/utils/project-helpers";

export default async function ViewerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const processedProjects = getFilteredAndSortedProjects(MOCK_PROJECTS, resolvedParams);

  return (
    <main className="mx-auto px-4 lg:px-24 w-full flex-1 relative ">
      <HeroBanner />

      <div className="mb-2 mt-4">
        <h1 className="text-2xl font-bold text-primary">Project Dashboard</h1>
        <p className="text-sm text-gray-500">
          Follow and engage in USSC Projects and Initiatives
        </p>
      </div>

      <ProjectFilters />

      <div className="space-y-6">

        {processedProjects.length > 0 ? (
          processedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              userRole="viewer"
              project={project}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
            <p className="text-sm text-gray-500 font-medium">No projects matched your search or filters.</p>
          </div>
        )}

        <div className="text-center py-10">
          <p className="text-xs text-gray-400 font-medium">
            No more projects to
            <br />
            show
          </p>
        </div>
      </div>

      <FaqFab />
    </main>
  );
}