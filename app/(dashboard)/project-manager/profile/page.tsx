import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "@/app/components/settings/ProfileClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "My Profile - OnTrack",
};

export default async function PMProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const initialData = {
    id: user.id,
    email: user.email || "",
    full_name: profile?.full_name || "",
    username: profile?.username || "",
    avatar_url: profile?.avatar_url || null,
    position: profile?.role === 'project-manager' ? "Lead Project Manager" : "Officer",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen w-full">
      <ProfileClient role="project-manager" initialData={initialData} />
    </div>
  );
}