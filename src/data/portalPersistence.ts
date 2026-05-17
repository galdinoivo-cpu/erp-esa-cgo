import type { PortalClienteDatabase } from "@/types/clientePortal";

export const LS_PORTAL = "erp_esa_portal_cliente_v1";

export function loadPortalDb(): PortalClienteDatabase | null {
  try {
    const raw = localStorage.getItem(LS_PORTAL);
    if (!raw) return null;
    return JSON.parse(raw) as PortalClienteDatabase;
  } catch {
    return null;
  }
}

export function savePortalDb(db: PortalClienteDatabase): void {
  localStorage.setItem(LS_PORTAL, JSON.stringify(db));
}
