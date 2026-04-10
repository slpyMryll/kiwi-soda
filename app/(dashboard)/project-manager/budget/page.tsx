import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PmBudgetClient } from "./PmBudgetClient";

export const metadata = {
  title: "Budget Oversight | Ontrack",
  description: "Monitor and manage budget allocations across all projects.",
};

export default async function PmBudgetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      total_budget,
      spent_budget,
      image_url,
      status,
      deadline
    `)
    .eq('manager_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching budget data:", error);
  }

  const formattedProjects = (projects || []).map((p: any) => ({
    id: p.id,
    title: p.title || "Untitled Project",
    totalBudget: Number(p.total_budget || 0),
    spentBudget: Number(p.spent_budget || 0),
    imageUrl: p.image_url,
    status: p.status,
    deadline: p.deadline
  }));

  return <PmBudgetClient initialProjects={formattedProjects} />;
}