import { createClient } from "@/lib/supabase/server";
import PmProjectsClient from "./PmProjectsClient";
import { getProjectsByManager, getActiveTerm } from "@/lib/actions/project"; //

export default async function PmProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const resolvedParams = await searchParams;
  const q = resolvedParams?.q || "";
  const status = resolvedParams?.status || "all";
  const sort = resolvedParams?.sort || "newest";
  const dateFilter = resolvedParams?.date || "all";
  const page = parseInt(resolvedParams?.page || "1");

  // Fetch the active term ID
  const activeTerm = await getActiveTerm();
  const activeTermId = activeTerm?.id || "";

  const result = await getProjectsByManager(user.id, { 
    q, 
    status, 
    sort, 
    dateFilter, 
    page 
  });

  return (
    <PmProjectsClient
      projects={result.projects}
      currentPage={page}
      totalPages={result.totalPages}
      totalFiltered={result.totalFiltered}
      stats={result.stats}
      currentUserId={user.id}
      activeTermId={activeTermId}
    />
  );
}