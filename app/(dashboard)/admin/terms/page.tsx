import { getTermsAndOfficers, getProjectManagers } from "@/lib/actions/admin-management";
import { TermsClient } from "./TermClient";

export const dynamic = "force-dynamic";

export default async function AdminTermsPage() {
  const [terms, pms] = await Promise.all([
    getTermsAndOfficers(),
    getProjectManagers()
  ]);
  
  return <TermsClient initialTerms={terms} availablePMs={pms} />;
}