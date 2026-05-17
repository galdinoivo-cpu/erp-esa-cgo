import type { AuthDatabase, AuthSession, ErpUser } from "@/types/auth";

/** Utilizadores (cadastro) — persistem entre visitas */
export const LS_AUTH = "erp_esa_auth_v1";

/** Sessão de login — só nesta aba do browser (fecha aba = novo login) */
export const SS_SESSION = "erp_esa_session_v1";

export function loadUsers(): ErpUser[] | null {
  try {
    const raw = localStorage.getItem(LS_AUTH);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthDatabase | { users: ErpUser[] };
    if (Array.isArray((parsed as { users?: ErpUser[] }).users)) {
      return (parsed as AuthDatabase).users;
    }
    return null;
  } catch {
    return null;
  }
}

/** Grava só utilizadores; nunca grava sessão no localStorage */
export function saveUsers(users: ErpUser[]): void {
  const payload: Pick<AuthDatabase, "users" | "session"> = {
    users,
    session: null,
  };
  localStorage.setItem(LS_AUTH, JSON.stringify(payload));
}

/** Remove sessão antiga que ficou no localStorage (versão anterior do app) */
export function migrateClearPersistedSession(): void {
  try {
    const raw = localStorage.getItem(LS_AUTH);
    if (!raw) return;
    const parsed = JSON.parse(raw) as AuthDatabase;
    if (parsed.session) {
      parsed.session = null;
      localStorage.setItem(LS_AUTH, JSON.stringify(parsed));
    }
  } catch {
    /* ignore */
  }
}

export function loadSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(SS_SESSION);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  sessionStorage.setItem(SS_SESSION, JSON.stringify(session));
}

export function clearSession(): void {
  sessionStorage.removeItem(SS_SESSION);
}

/** Compat: export/import JSON completo (sem reativar sessão) */
export function loadAuthDb(): AuthDatabase | null {
  const users = loadUsers();
  if (!users) return null;
  return { users, session: null };
}

export function saveAuthDb(db: AuthDatabase): void {
  saveUsers(db.users);
}
