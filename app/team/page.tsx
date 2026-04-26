import { getSystemSettings } from "@/lib/actions/system";
import { Header } from "@/app/components/layout/Header";
import { Footer } from "@/app/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

export default async function TeamPage() {
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

  const techTeam = [
    { name: "Marylle Laguna", role: "Project Manager", image: "/logov3.png" },
    { name: "Israel Binongo", role: "Lead Developer", image: "/logov3.png" },
    { name: "Eulo Rod Coting", role: "Test Engineer", image: "/logov3.png" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg-main">
      <Header user={user} profile={profile} role={profile?.role} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#153B44] mb-4">Meet the Team</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The dedicated individuals working behind the scenes to foster transparency and innovation at VSU.
          </p>
        </div>

        {/* Tech Team Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-[#1B4332] mb-8 text-center uppercase tracking-wider">Tech Development Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {techTeam.map((member) => (
              <div key={member.name} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition-transform hover:scale-105">
                <div className="w-24 h-24 bg-surface-accent/10 rounded-full mb-4 flex items-center justify-center overflow-hidden border-2 border-[#1B4332]/20">
                  <Image src={member.image} alt={member.name} width={96} height={96} className="object-cover" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-[#1B4332] font-medium text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Officers Section Placeholder */}
        <section>
          <h2 className="text-2xl font-bold text-[#1B4332] mb-8 text-center uppercase tracking-wider">USSC Officers</h2>
          <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
            <p className="text-gray-500 italic">USSC Officer profiles are currently being updated by the administration.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
