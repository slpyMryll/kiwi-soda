import { createClient } from "@/lib/supabase/server";
import { ProjectDetailView } from "@/app/components/projects/ProjectDetailView";
import { MOCK_PROJECTS } from "@/lib/constants/mock-data";
import { notFound } from "next/navigation";

export default async function ViewerProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Get User Role to pass to the component
  const { data: { user } } = await supabase.auth.getUser();
  let userRole: any = "viewer";
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile) userRole = profile.role;
  }

  // TODO: Fetch from actual Supabase 'projects' table instead of MOCK_PROJECTS
  const project = MOCK_PROJECTS.find(p => p.id === id);

  if (!project) return notFound();

  return (
    <div className="w-full h-full bg-bg-main relative">
      {/* We reuse the exact same component, setting isModal to false */}
      <ProjectDetailView project={project} userRole={userRole} isModal={false} />
    </div>
  );
}