import { SettingsClient } from "@/app/components/settings/SettingsClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings - OnTrack",
  description: "Manage your platform preferences and notifications.",
};

export default async function ViewerSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email_alerts, push_alerts, in_app_alerts, followed_project_updates, weekly_digest")
    .eq("id", user.id)
    .single();

  const initialData = {
    email_alerts: profile?.email_alerts ?? true,
    push_alerts: profile?.push_alerts ?? false,
    in_app_alerts: profile?.in_app_alerts ?? true,
    followed_project_updates: profile?.followed_project_updates ?? true,
    weekly_digest: profile?.weekly_digest ?? true,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen w-full">
      <SettingsClient role="viewer" initialData={initialData} />
    </div>
  );
}