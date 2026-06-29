"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function ChangePassword() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function salvar() {
    setMsg(null);
    if (senha.length < 6) {
      setMsg({ ok: false, text: "A senha precisa ter ao menos 6 caracteres." });
      return;
    }
    if (senha !== confirma) {
      setMsg({ ok: false, text: "As senhas não conferem." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setLoading(false);
    if (error) setMsg({ ok: false, text: "Não foi possível trocar a senha. Tente entrar de novo." });
    else {
      setMsg({ ok: true, text: "Senha alterada com sucesso!" });
      setSenha("");
      setConfirma("");
    }
  }

  return (
    <div className="max-w-sm space-y-3 rounded-xl border border-white/10 p-6">
      <input
        type="password"
        placeholder="Nova senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2"
      />
      <input
        type="password"
        placeholder="Confirmar nova senha"
        value={confirma}
        onChange={(e) => setConfirma(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && salvar()}
        className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2"
      />
      {msg && (
        <p className={`text-sm ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>{msg.text}</p>
      )}
      <button
        onClick={salvar}
        disabled={loading}
        className="rounded-lg bg-brand px-4 py-2 font-medium text-brand-fg disabled:opacity-50"
      >
        {loading ? "…" : "Salvar nova senha"}
      </button>
    </div>
  );
}