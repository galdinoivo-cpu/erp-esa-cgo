/**
 * Chave mestre do Diretor CGO.
 * Produção: definir VITE_CGO_MASTER_PASSWORD no .env (nunca commitar .env).
 * Protótipo: fallback apenas para desenvolvimento local.
 */
export function getMasterPassword(): string {
  const fromEnv = import.meta.env.VITE_CGO_MASTER_PASSWORD;
  if (typeof fromEnv === "string" && fromEnv.length > 0) {
    return fromEnv;
  }
  if (import.meta.env.PROD) {
    console.warn(
      "[ESA ERP] VITE_CGO_MASTER_PASSWORD não definida em produção. Login mestre desativado."
    );
    return "";
  }
  return "ESA-DIRETOR-2026";
}

/** Login fixo para entrada com chave mestre (perfil DIRETOR_CGO_MASTER) */
export const MASTER_LOGIN_USERNAME = "diretor.cgo";
