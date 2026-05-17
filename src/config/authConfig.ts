/**
 * Chave mestre do Diretor CGO.
 * Produção: definir VITE_CGO_MASTER_PASSWORD no .env (nunca commitar .env).
 * Protótipo: fallback apenas para desenvolvimento local.
 */
/** Senha padrão do diretor no protótipo (seed + GitHub Pages sem .env). */
export const DEFAULT_MASTER_PASSWORD = "ESA-DIRETOR-2026";

export function getMasterPassword(): string {
  const fromEnv = import.meta.env.VITE_CGO_MASTER_PASSWORD;
  if (typeof fromEnv === "string" && fromEnv.length > 0) {
    return fromEnv;
  }
  return DEFAULT_MASTER_PASSWORD;
}

/** Login fixo para entrada com chave mestre (perfil DIRETOR_CGO_MASTER) */
export const MASTER_LOGIN_USERNAME = "diretor.cgo";
