import { SupportClient } from "@/app/components/support/SupportClient";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Support - OnTrack",
  description: "Get help and support for the OnTrack platform.",
};

export default async function PMSupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen w-full">
      <SupportClient userEmail={user?.email} userId={user?.id} />
    </div>
  );
}