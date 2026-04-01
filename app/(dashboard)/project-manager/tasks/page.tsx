import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PmTasksClient, Task } from "./PmTasksClient";

export const metadata = {
  title: "My Tasks | Ontrack",
  description: "Manage your assigned tasks and project deliverables.",
};

export default async function PmTasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: rawTasks, error } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      due_date,
      status,
      projects ( id, title, manager_id )
    `)
    .eq('assigned_to', user.id)
    .order('due_date', { ascending: true });

  if (error) {
    console.error("Error fetching tasks:", error);
  }

  const formattedTasks: Task[] = (rawTasks || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    dueDate: t.due_date,
    status: t.status,
    projectId: t.projects?.id || "",
    projectName: t.projects?.title || "Unknown Project",
    isProjectLead: t.projects?.manager_id === user.id 
  }));

  return <PmTasksClient initialTasks={formattedTasks} />;
}