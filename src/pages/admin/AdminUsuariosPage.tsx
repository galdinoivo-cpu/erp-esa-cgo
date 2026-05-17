import { useState } from "react";
import { Link } from "react-router-dom";
import ShellHeader from "@/components/ShellHeader";
import { PROFILE_LABELS } from "@/domain/authRoutes";
import { useAuth } from "@/state/AuthContext";
import type { ErpUser, UserProfile, UserStatus } from "@/types/auth";

const PROFILES = Object.keys(PROFILE_LABELS) as UserProfile[];

export default function AdminUsuariosPage() {
  const { authDb, upsertUser, resetUserPassword, setUserStatus, currentUser } = useAuth();
  const [editing, setEditing] = useState<ErpUser | null>(null);

  function newUser(): ErpUser {
    return {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      nomeCompleto: "",
      documento: "",
      login: "",
      passwordHash: "",
      email: "",
      telefone: "",
      perfil: "COLR_TR",
      colrId: "COLR-BA-001",
      empresaTerceirizada: null,
      isTerceirizado: false,
      status: "pendente",
      observacoes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: currentUser?.id ?? null,
    };
  }

  return (
    <>
      <ShellHeader title="Administração de Usuários" subtitle="Diretor CGO — cadastro individual" />
      <main className="max-w-5xl mx-auto p-4 space-y-4">
        <Link to="/cgo" className="text-sm text-cgo-accent hover:underline">
          ← Voltar ao CGO
        </Link>
        <button
          type="button"
          className="rounded-md bg-cgo-accent px-4 py-2 text-sm text-white"
          onClick={() => setEditing(newUser())}
        >
          Criar usuário
        </button>
        <table className="w-full text-sm border border-cgo-border rounded-lg overflow-hidden">
          <thead className="bg-cgo-panel text-cgo-muted text-left text-xs uppercase">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Login</th>
              <th className="p-3">Perfil</th>
              <th className="p-3">COLR</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {authDb.users.map((u) => (
              <tr key={u.id} className="border-t border-cgo-border">
                <td className="p-3 text-white">{u.nomeCompleto}</td>
                <td className="p-3 font-mono text-xs">{u.login}</td>
                <td className="p-3 text-xs">{PROFILE_LABELS[u.perfil]}</td>
                <td className="p-3 text-xs">{u.colrId ?? "—"}</td>
                <td className="p-3">{u.status}</td>
                <td className="p-3 space-x-2">
                  <button type="button" className="text-cgo-accent text-xs" onClick={() => setEditing({ ...u })}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editing && (
          <UserForm
            user={editing}
            onClose={() => setEditing(null)}
            onSave={(u, pw) => {
              upsertUser(u, pw);
              setEditing(null);
            }}
            onResetPw={(id, pw) => resetUserPassword(id, pw)}
            onStatus={(id, st) => setUserStatus(id, st)}
          />
        )}
      </main>
    </>
  );
}

function UserForm({
  user,
  onClose,
  onSave,
  onResetPw,
  onStatus,
}: {
  user: ErpUser;
  onClose: () => void;
  onSave: (u: ErpUser, pw?: string) => void;
  onResetPw: (id: string, pw: string) => void;
  onStatus: (id: string, st: UserStatus) => void;
}) {
  const [form, setForm] = useState(user);
  const [senha, setSenha] = useState("");
  const [resetPw, setResetPw] = useState("");

  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
      <form
        className="w-full max-w-lg rounded-xl border border-cgo-border bg-cgo-panel p-4 space-y-3 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form, senha || undefined);
        }}
      >
        <h3 className="text-lg font-semibold text-white">Usuário</h3>
        <Field label="Nome completo" value={form.nomeCompleto} onChange={(v) => setForm({ ...form, nomeCompleto: v })} />
        <Field label="CPF/documento" value={form.documento} onChange={(v) => setForm({ ...form, documento: v })} />
        <Field label="Login" value={form.login} onChange={(v) => setForm({ ...form, login: v })} />
        <Field label="E-mail" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field label="Telefone/WhatsApp" value={form.telefone} onChange={(v) => setForm({ ...form, telefone: v })} />
        <label className="block">
          <span className="text-cgo-muted text-xs">Perfil</span>
          <select
            className="w-full mt-1 rounded bg-cgo-bg border border-cgo-border px-2 py-1.5"
            value={form.perfil}
            onChange={(e) => setForm({ ...form, perfil: e.target.value as UserProfile })}
          >
            {PROFILES.map((p) => (
              <option key={p} value={p}>
                {PROFILE_LABELS[p]}
              </option>
            ))}
          </select>
        </label>
        <Field label="COLR vinculado (id)" value={form.colrId ?? ""} onChange={(v) => setForm({ ...form, colrId: v || null })} />
        <Field
          label="Empresa terceirizada"
          value={form.empresaTerceirizada ?? ""}
          onChange={(v) => setForm({ ...form, empresaTerceirizada: v || null, isTerceirizado: !!v })}
        />
        <Field label="Senha provisória (novo)" value={senha} onChange={setSenha} type="password" />
        <label className="block">
          <span className="text-cgo-muted text-xs">Status</span>
          <select
            className="w-full mt-1 rounded bg-cgo-bg border border-cgo-border px-2 py-1.5"
            value={form.status}
            onChange={(e) => {
              const st = e.target.value as UserStatus;
              setForm({ ...form, status: st });
              onStatus(form.id, st);
            }}
          >
            <option value="ativo">ativo</option>
            <option value="bloqueado">bloqueado</option>
            <option value="pendente">pendente</option>
          </select>
        </label>
        <Field label="Observações" value={form.observacoes} onChange={(v) => setForm({ ...form, observacoes: v })} />
        {form.id && (
          <div className="flex gap-2 items-end">
            <Field label="Resetar senha" value={resetPw} onChange={setResetPw} type="password" />
            <button
              type="button"
              className="rounded border border-cgo-border px-3 py-2 text-xs"
              onClick={() => resetPw && onResetPw(form.id, resetPw)}
            >
              Aplicar reset
            </button>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button type="button" className="flex-1 border border-cgo-border rounded py-2" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="flex-1 bg-cgo-accent rounded py-2 text-white">
            Guardar
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-cgo-muted text-xs">{label}</span>
      <input
        type={type}
        className="w-full mt-1 rounded bg-cgo-bg border border-cgo-border px-2 py-1.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
