import { SupportClient } from "@/app/components/support/SupportClient";

export const metadata = {
  title: "Support - OnTrack",
  description: "Get help and support for the OnTrack platform.",
};

export default function ViewerSupportPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen w-full">
      <SupportClient role="viewer" />
    </div>
  );
}