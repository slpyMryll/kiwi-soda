import { createClient } from "@/lib/supabase/server";
import { getActiveTerm } from "@/lib/actions/project";
import { TransparencyClient } from "./TransparencyClient";

export default async function TransparencyHubPage() {
  const supabase = await createClient();
  const activeTerm = await getActiveTerm();

  const { data: projects } = await supabase
    .from("projects")
    .select("status, total_budget, spent_budget")
    .eq("term_id", activeTerm?.id);

  const stats = {
    total: projects?.length || 0,
    completed: projects?.filter(p => p.status === "Completed").length || 0,
    totalSpent: projects?.reduce((sum, p) => sum + (p.spent_budget || 0), 0) || 0,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#153B44]">Transparency Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Organizational performance and impact tracking for {activeTerm?.name}.</p>
        </div>
        <TransparencyClient stats={stats} termName={activeTerm?.name} />
      </div>
    </div>
  );
}