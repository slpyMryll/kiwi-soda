import { SettingsClient } from "@/app/components/settings/SettingsClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings - OnTrack",
  description: "Manage your platform preferences and notifications.",
};

export default async function PMSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email_alerts, push_alerts, in_app_alerts, budget_alerts, overdue_task_alerts")
    .eq("id", user.id)
    .single();

  const initialData = {
    email_alerts: profile?.email_alerts ?? true,
    push_alerts: profile?.push_alerts ?? false,
    in_app_alerts: profile?.in_app_alerts ?? true,
    budget_alerts: profile?.budget_alerts ?? true,
    overdue_task_alerts: profile?.overdue_task_alerts ?? true,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen w-full">
      <SettingsClient role="project-manager" initialData={initialData} userId={user.id} />
    </div>
  );
}