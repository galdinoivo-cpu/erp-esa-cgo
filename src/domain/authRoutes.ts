import type { UserProfile } from "@/types/auth";

/** Rota inicial após login conforme perfil */
export function homePathForProfile(perfil: UserProfile): string {
  switch (perfil) {
    case "DIRETOR_CGO_MASTER":
    case "CGO_ADMIN":
      return "/cgo";
    case "COLR_GERENCIA":
      return "/colr/gerencia";
    case "COLR_TR":
      return "/colr/tr";
    case "COLR_MANUTENCAO":
      return "/colr/manutencao";
    case "TERCEIRIZADO_OPERADOR":
      return "/operador/oce";
    case "ENGENHEIRO_CLIENTE":
      return "/cliente/engenheiro";
    default:
      return "/login";
  }
}

export function profilesAllowedForPath(
  path: string
): UserProfile[] | "public" {
  if (path === "/login" || path.startsWith("/login")) return "public";
  if (path.startsWith("/cgo/admin-usuarios")) {
    return ["DIRETOR_CGO_MASTER"];
  }
  if (path.startsWith("/cgo")) {
    return ["DIRETOR_CGO_MASTER", "CGO_ADMIN"];
  }
  if (path.startsWith("/colr/gerencia")) {
    return ["COLR_GERENCIA", "DIRETOR_CGO_MASTER"];
  }
  if (path.startsWith("/colr/tr")) {
    return ["COLR_TR", "DIRETOR_CGO_MASTER"];
  }
  if (path.startsWith("/colr/manutencao")) {
    return ["COLR_MANUTENCAO", "DIRETOR_CGO_MASTER"];
  }
  if (path.startsWith("/operador")) {
    return ["TERCEIRIZADO_OPERADOR", "DIRETOR_CGO_MASTER"];
  }
  if (path.startsWith("/cliente/engenheiro")) {
    return ["ENGENHEIRO_CLIENTE", "DIRETOR_CGO_MASTER"];
  }
  return ["DIRETOR_CGO_MASTER"];
}

export function canAccess(userPerfil: UserProfile, path: string): boolean {
  const allowed = profilesAllowedForPath(path);
  if (allowed === "public") return true;
  return allowed.includes(userPerfil);
}

export const PROFILE_LABELS: Record<UserProfile, string> = {
  DIRETOR_CGO_MASTER: "Diretor CGO (Master)",
  CGO_ADMIN: "CGO Admin",
  COLR_GERENCIA: "COLR Gerência",
  COLR_TR: "COLR TR — Entrega/Recebimento",
  COLR_MANUTENCAO: "COLR Manutenção",
  TERCEIRIZADO_OPERADOR: "Operador terceirizado",
  ENGENHEIRO_CLIENTE: "Portal do Engenheiro",
};
