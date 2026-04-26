import { getSystemSettings } from "@/lib/actions/system";
import { Header } from "@/app/components/layout/Header";
import { Footer } from "@/app/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function AboutPage() {
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
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#153B44] mb-4">About OnTrack</h1>
          <p className="text-xl text-gray-600 font-medium">Fostering Trust Through Transparency</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1B4332]">What is OnTrack?</h2>
            <p className="text-gray-700 leading-relaxed">
              OnTrack is the official Project Hub of the VSU University Supreme Student Council (USSC). It serves as a centralized platform designed to bridge the gap between student leaders and the student body.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By providing real-time tracking of council projects, budget allocations, and initiative progress, we ensure that every Viscan is informed and empowered to participate in university governance.
            </p>
          </div>
          <div className="bg-[#1B4332]/5 p-8 rounded-3xl border border-[#1B4332]/10">
            <h3 className="font-bold text-[#1B4332] mb-4">Our Core Mission</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center shrink-0 text-xs">1</div>
                <p className="text-sm text-gray-600"><span className="font-bold text-gray-900">Transparency:</span> Providing clear visibility into how student contributions are utilized.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center shrink-0 text-xs">2</div>
                <p className="text-sm text-gray-600"><span className="font-bold text-gray-900">Engagement:</span> Encouraging student feedback and collaboration on council initiatives.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center shrink-0 text-xs">3</div>
                <p className="text-sm text-gray-600"><span className="font-bold text-gray-900">Accountability:</span> Ensuring project deadlines and budget targets are strictly monitored.</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
          <h2 className="text-2xl font-bold text-[#1B4332] mb-4">How it Works</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            From project proposal to final implementation, every step is documented. Browse through active projects, check budget histories, and stay updated with the latest USSC announcements.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4">
              <h4 className="font-bold text-gray-900 mb-2">Explore</h4>
              <p className="text-xs text-gray-500">Discover active and upcoming projects across the university.</p>
            </div>
            <div className="p-4 border-y md:border-y-0 md:border-x border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">Track</h4>
              <p className="text-xs text-gray-500">Monitor real-time progress and financial transparency.</p>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-gray-900 mb-2">Engage</h4>
              <p className="text-xs text-gray-500">Provide feedback and follow projects that matter to you.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
