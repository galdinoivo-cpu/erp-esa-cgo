import type { CgoDatabase } from "@/types";

export const LS_KEY = "erp_esa_cgo_db_v1";

export function loadDb(): CgoDatabase | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CgoDatabase;
  } catch {
    return null;
  }
}

export function saveDb(db: CgoDatabase): void {
  localStorage.setItem(LS_KEY, JSON.stringify(db));
}

export function exportDbJson(db: CgoDatabase): string {
  return JSON.stringify(db, null, 2);
}

export function importDbJson(text: string): CgoDatabase {
  const o = JSON.parse(text) as CgoDatabase;
  if (!o.operationInstances || !o.operationTemplates) {
    throw new Error("JSON inválido para CGO");
  }
  return o;
}
