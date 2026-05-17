import type { OceDatabase } from "@/types/oce";

export const LS_OCE = "erp_esa_oce_v1";

export function loadOceDb(): OceDatabase | null {
  try {
    const raw = localStorage.getItem(LS_OCE);
    if (!raw) return null;
    return JSON.parse(raw) as OceDatabase;
  } catch {
    return null;
  }
}

export function saveOceDb(db: OceDatabase): void {
  localStorage.setItem(LS_OCE, JSON.stringify(db));
}
