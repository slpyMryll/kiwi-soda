import { getAllPlatformComments } from "@/lib/actions/moderation";
import { ModerationClient } from "./ModerationClient";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const comments = await getAllPlatformComments();

  return <ModerationClient initialComments={comments} />;
}