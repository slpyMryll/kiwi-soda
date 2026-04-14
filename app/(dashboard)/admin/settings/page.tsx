import { getSystemSettings } from "@/lib/actions/system";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const initialSettings = await getSystemSettings();
  
  return <SettingsClient initialSettings={initialSettings} />;
}