import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ContentRail } from "./components/landing/ContentRail";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { HeroBanner } from "./components/dashboard/HeroBanner";
import { ProjectFilters } from "./components/dashboard/ProjectFilters";
import { InfiniteProjectFeed } from "./components/dashboard/InfiniteProjectFeed";
import { redirect } from "next/navigation";
import { getInfiniteProjects } from "@/lib/actions/project-feed";
import { getAllTerms, getActiveTerm } from "@/lib/actions/project";

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
    redirect("/dashboard-redirect");
  }

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

        <main className="flex-1 flex flex-col overflow-x-hidden bg-linear-to-b from-[#153B44] from-0% via-bg-main via-[300px] to-bg-main">
          <div className="px-4 lg:px-24 mx-auto w-full flex-1">
            <HeroBanner terms={terms} currentTermId={activeTermId} />
            
            <div className="mb-2 mt-8">
              <h2 className="text-2xl font-bold text-[#1B4332]">
                Project Dashboard
              </h2>
              <p className="text-sm text-gray-500">
                Explore and follow USSC Projects and Initiatives
              </p>
            </div>

            <ProjectFilters />

            <InfiniteProjectFeed
              initialProjects={initialProjects}
              userRole="guest"
              searchParams={{ q, status, sort, termId: activeTermId }}
            />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}