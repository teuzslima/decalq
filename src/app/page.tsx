import { redirect } from "next/navigation";
import { headers } from "next/headers";
import LandingPage from "@/components/LandingPage";

const ROOT_DOMAIN = (process.env.ROOT_DOMAIN ?? "decalq.site").split(":")[0];

export default function Home() {
  const host = (headers().get("x-tenant-host") ?? headers().get("host") ?? "")
    .toLowerCase()
    .split(":")[0];

  // Subdomínio de estúdio (ex: junior.decalq.site) -> vai pro app
  const isStudioSubdomain =
    host.endsWith(`.${ROOT_DOMAIN}`) && host !== `www.${ROOT_DOMAIN}`;

  if (isStudioSubdomain) {
    redirect("/dashboard");
  }

  // Domínio raiz (decalq.site / www) -> mostra a landing
  return <LandingPage />;
}