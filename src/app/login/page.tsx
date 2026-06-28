"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    const fn =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });
    const { error } = await fn;
    setLoading(false);
    if (error) setError(error.message);
    else window.location.href = "/dashboard";
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="font-display text-3xl">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2"
          />
          <input
            type="password"
            placeholder="senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg bg-brand py-2.5 font-medium text-brand-fg disabled:opacity-50"
        >
          {loading ? "…" : mode === "login" ? "Entrar" : "Cadastrar"}
        </button>
        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full text-center text-sm text-ink/50 hover:text-ink"
        >
          {mode === "login" ? "Não tem conta? Cadastre-se" : "Já tenho conta"}
        </button>
      </div>
    </div>
  );
}
