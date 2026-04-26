import { ProjectFilters } from "@/app/components/dashboard/ProjectFilters";
import { InfiniteProjectFeed } from "@/app/components/dashboard/InfiniteProjectFeed";
import { getActiveTerm } from "@/lib/actions/project";
import { FollowedStats } from "@/app/components/dashboard/FollowStatCard";
import { getFollowedStats } from "@/lib/actions/follow";

export const metadata = {
  title: "Following - OnTrack",
  description: "Stay updated on the projects you are following. View project progress, updates, and activity in one place.",
};


export default async function ViewerFollowingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const [currentActiveTerm, stats] = await Promise.all([
    getActiveTerm(),
    getFollowedStats()
  ]);

  const activeTermId = resolvedParams?.term || currentActiveTerm?.id || "";

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen w-full">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-[#153B44]">
            My Following
          </h1>
          <p className="text-sm text-gray-500">
            Stay updated on the projects you are following
          </p>
        </div>

        <FollowedStats
          complete={stats?.complete || 0}
          ongoing={stats?.ongoing || 0}
          followed={stats?.followed || 0}
          updates={stats?.updates || 0}
        />

        <ProjectFilters termId={activeTermId} followingOnly={true} />

        <InfiniteProjectFeed
          userRole="viewer"
          termId={activeTermId}
          followingOnly={true}
        />
      </div>
    </main>
  );
}