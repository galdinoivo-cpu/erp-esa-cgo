import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/state/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = login(user, pass);
    if (!res.ok) {
      setError(res.error ?? "Login inválido.");
      return;
    }
    navigate(res.redirect ?? "/login", { replace: true });
  }

  return (
    <section className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cgo-bg via-[#121a24] to-cgo-bg">
      <article className="w-full max-w-md rounded-2xl border border-cgo-border bg-cgo-panel shadow-2xl p-8">
        <header className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cgo-muted">ESA</p>
          <h1 className="text-2xl font-bold text-white mt-1">Portal ERP ESA</h1>
          <p className="text-sm text-cgo-muted mt-2">Acesso individual por perfil</p>
          <p className="text-[11px] text-cgo-muted mt-3">
            Cada visita começa aqui. A sessão vale só nesta aba — use <strong className="text-slate-400">Sair</strong> ao
            terminar.
          </p>
        </header>

        <form onSubmit={submit} className="space-y-4" autoComplete="off">
          <label className="block text-sm">
            <span className="text-cgo-muted">Usuário</span>
            <input
              required
              autoComplete="off"
              name="esa-login-user"
              className="mt-1 w-full rounded-lg bg-cgo-bg border border-cgo-border px-3 py-2.5 text-white"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="ex.: ana.cgo ou diretor.cgo"
            />
          </label>
          <label className="block text-sm">
            <span className="text-cgo-muted">Senha</span>
            <input
              required
              type="password"
              autoComplete="new-password"
              name="esa-login-pass"
              className="mt-1 w-full rounded-lg bg-cgo-bg border border-cgo-border px-3 py-2.5 text-white"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </label>
          {error && (
            <p className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-cgo-accent py-2.5 font-semibold text-white hover:bg-blue-600"
          >
            Entrar
          </button>
        </form>

        <details className="mt-6 text-xs text-cgo-muted">
          <summary className="cursor-pointer hover:text-slate-300">Contas demo (protótipo)</summary>
          <ul className="mt-2 space-y-1 list-disc pl-4">
            <li>
              <strong className="text-slate-300">diretor.cgo</strong> / <strong className="text-slate-300">ESA-DIRETOR-2026</strong>{" "}
              — Diretor CGO (não digite &quot;chave mestre&quot;, use a senha)
            </li>
            <li>ana.cgo / cgo123 — CGO Admin</li>
            <li>gerente.ba / colr123 — COLR Gerência</li>
            <li>tr.ba / tr123 — COLR TR</li>
            <li>manut.ms / manut123 — Manutenção</li>
            <li>carlos.silva / operador123 — Operador OCE</li>
            <li>rafael.eng / eng123 — Portal do Engenheiro (Fazenda Santa Clara)</li>
          </ul>
        </details>
      </article>
    </section>
  );
}
