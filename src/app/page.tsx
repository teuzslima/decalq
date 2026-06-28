import { redirect } from "next/navigation";
import { headers } from "next/headers";
import LandingPage from "@/components/LandingPage";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

export default function Home() {
  const host = headers().get("x-tenant-host") ?? headers().get("host") ?? "";
  const isRootDomain = host.split(":")[0] === ROOT_DOMAIN.split(":")[0];

  if (!isRootDomain) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
