import { getSystemSettings } from "@/lib/actions/system";
import { Header } from "@/app/components/layout/Header";
import { Footer } from "@/app/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function PrivacyPage() {
  const settings = await getSystemSettings();
  
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role, full_name, avatar_url")
      .eq("id", user.id)
      .single();
    profile = data;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-bg-main">
      <Header user={user} profile={profile} role={profile?.role} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-16">
        <h1 className="text-3xl font-bold text-[#153B44] mb-8">Privacy Policy</h1>
        <div className="prose prose-sm sm:prose-base prose-green max-w-none bg-white p-8 rounded-2xl shadow-sm border border-gray-100 whitespace-pre-wrap text-gray-700">
          {settings.legal_privacy || "Content is currently being updated by the USSC Administration."}
        </div>
      </main>
      <Footer />
    </div>
  );
}