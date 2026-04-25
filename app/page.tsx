import { createClient } from "@/lib/supabase/server";
import { ContentRail } from "./components/landing/ContentRail";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { HeroBanner } from "./components/dashboard/HeroBanner";
import { ProjectFilters } from "./components/dashboard/ProjectFilters";
import { InfiniteProjectFeed } from "./components/dashboard/InfiniteProjectFeed";
import { getAllTerms, getActiveTerm } from "@/lib/actions/project";

export default async function LandingPage({
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

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role, full_name, avatar_url")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-main">
      <Header user={user} profile={profile} role={profile?.role} />

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

            <ProjectFilters termId={activeTermId}/>

            <InfiniteProjectFeed
              userRole={profile?.role || "guest"}
              termId={activeTermId}
            />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}