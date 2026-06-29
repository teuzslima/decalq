import AppShell from "@/components/AppShell";
import { getCurrentUser } from "@/server/context";
import ChangePassword from "@/components/ChangePassword";

export default async function AccountPage() {
  const { user } = await getCurrentUser();

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h2 className="font-display text-2xl">Minha conta</h2>
          <p className="text-sm text-ink/60">{user?.email}</p>
        </div>

        <section>
          <h3 className="mb-3 text-sm uppercase tracking-wide text-ink/50">Trocar senha</h3>
          <ChangePassword />
        </section>
      </div>
    </AppShell>
  );
}