import type { OceChecklistItem, OceRecord, OceStatus } from "@/types/oce";

export function allMandatoryItemsValidated(items: OceChecklistItem[]): boolean {
  return items
    .filter((i) => i.obrigatorio)
    .every((i) => i.status === "validado");
}

export function hasCriticalBlock(items: OceChecklistItem[]): boolean {
  return items.some((i) => i.obrigatorio && i.status === "bloqueado");
}

export function hasCorrectableDivergence(items: OceChecklistItem[]): boolean {
  return items.some((i) => i.status === "divergente");
}

export function deriveOceStatusFromChecklist(oce: OceRecord): OceStatus {
  if (oce.status === "BLOQUEADA") return "BLOQUEADA";
  const items = oce.checklist_retirada;
  if (hasCriticalBlock(items)) return "BLOQUEADA";
  if (allMandatoryItemsValidated(items)) return "OPERACAO_AUTORIZADA";
  if (hasCorrectableDivergence(items)) return "CHECKLIST_DIVERGENTE";
  const anyStarted = items.some((i) => i.status !== "pendente");
  if (anyStarted) return "CHECKLIST_EM_ANDAMENTO";
  return "AGUARDANDO_RETIRADA";
}

export function trafficForOceStatus(status: OceStatus): "verde" | "amarelo" | "vermelho" {
  if (
    status === "OPERACAO_AUTORIZADA" ||
    status === "FINALIZADA" ||
    status === "OPERACAO_CONCLUIDA"
  ) {
    return "verde";
  }
  if (
    status === "CHECKLIST_DIVERGENTE" ||
    status === "CHECKLIST_EM_ANDAMENTO" ||
    status === "RETORNO_PENDENTE"
  ) {
    return "amarelo";
  }
  if (status === "BLOQUEADA" || status === "AGUARDANDO_RETIRADA") {
    return status === "BLOQUEADA" ? "vermelho" : "amarelo";
  }
  return "verde";
}
