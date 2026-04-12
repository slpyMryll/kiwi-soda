import { getSystemSettings } from "@/lib/actions/system";
import { Header } from "@/app/components/layout/Header";
import { Footer } from "@/app/components/layout/Footer";

export default async function CookiesPage() {
  const settings = await getSystemSettings();
  
  return (
    <div className="min-h-screen flex flex-col bg-bg-main">
      <Header user={null} profile={null} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-16">
        <h1 className="text-3xl font-bold text-[#153B44] mb-8">Cookie Policy</h1>
        
        <div className="prose prose-sm sm:prose-base prose-green max-w-none bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 whitespace-pre-wrap text-gray-700">
          {settings.legal_cookies || "Content is currently being updated by the USSC Administration."}
        </div>
      </main>

      <Footer />
    </div>
  );
}