import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PmTasksClient } from "./PmTasksClient";

export const metadata = {
  title: "My Tasks | Ontrack",
  description: "Manage your assigned tasks and project deliverables.",
};

export default async function PmTasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <PmTasksClient />;
}