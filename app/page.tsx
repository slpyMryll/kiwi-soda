import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ContentRail } from "./components/landing/ContentRail";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";

import { HeroBanner } from "./components/dashboard/HeroBanner";
import { ProjectFilters } from "./components/dashboard/ProjectFilters";
import { ProjectCard } from "./components/dashboard/ProjectCard";
import { MOCK_PROJECTS } from "@/lib/constants/mock-data";
import { getFilteredAndSortedProjects } from "@/lib/utils/project-helpers";
import { redirect } from "next/navigation";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard-redirect');
  }

  const resolvedParams = await searchParams;
  const processedProjects = getFilteredAndSortedProjects(
    MOCK_PROJECTS,
    resolvedParams,
  );

  return (
    <div className="flex flex-col min-h-screen bg-bg-main">
      <Header user={null} profile={null} />

      <div className="flex flex-1 relative">
        <div className="hidden lg:block">
          <ContentRail
            trendingTopics={[
              "#Budget Transparency",
              "#Student Projects",
              "#SSC",
            ]}
          />
        </div>

        <main className="flex-1 flex flex-col overflow-x-hidden bg-linear-to-b from-[#153B44] from-0% via-bg-main via-10% to-bg-main">
          <div className="px-4 lg:px-24 mx-auto w-full flex-1 ">
            <HeroBanner />
            <div className="mb-2 mt-8">
              <h2 className="text-2xl font-bold text-[#1B4332]">
                Project Dashboard
              </h2>
              <p className="text-sm text-gray-500">
                Explore and follow USSC Projects and Initiatives
              </p>
            </div>

            <ProjectFilters />

            <div className="space-y-6 mt-6">
              {processedProjects.length > 0 ? (
                processedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    userRole="guest"
                    project={project}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
                  <p className="text-sm text-gray-500 font-medium">
                    No projects matched your search or filters.
                  </p>
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
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}