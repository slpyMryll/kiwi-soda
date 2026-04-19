import { SettingsClient } from "@/app/components/settings/SettingsClient";

export const metadata = {
  title: "Settings - OnTrack",
  description: "Manage your platform preferences and notifications.",
};

export default function PMSettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen w-full">
      <SettingsClient role="project-manager" />
    </div>
  );
}