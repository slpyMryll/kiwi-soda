import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Sidebar } from "../components/layout/Sidebar";
import { PresencePinger } from "../components/layout/PresencePinger";

export const metadata = {
  title: "Explore - OnTrack",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col min-h-screen bg-bg-main">
      <Header user={user} profile={profile} role={profile?.role} />
      <PresencePinger />
      <div className="flex flex-1 relative w-full mx-auto">
        <Sidebar role={profile?.role} />

        <main className="flex-1 flex flex-col overflow-x-hidden bg-linear-to-b from-[#153B44] from-0% via-bg-main via-[300px] to-bg-main pb-24 md:pb-0">
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
