import type { AuthDatabase } from "@/types/auth";

export const LS_AUTH = "erp_esa_auth_v1";

export function loadAuthDb(): AuthDatabase | null {
  try {
    const raw = localStorage.getItem(LS_AUTH);
    if (!raw) return null;
    return JSON.parse(raw) as AuthDatabase;
  } catch {
    return null;
  }
}

export function saveAuthDb(db: AuthDatabase): void {
  localStorage.setItem(LS_AUTH, JSON.stringify(db));
}
