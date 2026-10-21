import { redirect } from "next/navigation";
import { landingPath } from "@/features/auth/navigation";
import { requireSession } from "@/features/auth/server/session";

export default async function Home() {
  const session = await requireSession();
  redirect(landingPath(session.permissions) ?? "/unauthorized");
}
