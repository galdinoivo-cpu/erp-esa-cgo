import type { EtapaStatus, LaudoStatus, ModeloPulverizacao, OsfStatus } from "@/types/clientePortal";

export const OSF_STATUS_LABELS: Record<OsfStatus, string> = {
  OSF_RASCUNHO: "Rascunho",
  OSF_ENVIADA: "Enviada para análise",
  EM_ANALISE_ESA: "Em análise ESA",
  AGUARDANDO_VALIDACAO_FINANCEIRA: "Aguardando validação financeira",
  AGUARDANDO_AGENDA: "Aguardando agenda",
  PROGRAMADA: "Programada",
  RECUSADA: "Recusada",
  CANCELADA: "Cancelada",
  CONVERTIDA_EM_OPERACAO: "Convertida em operação",
};

export const LAUDO_STATUS_LABELS: Record<LaudoStatus, string> = {
  AGUARDANDO_GERACAO: "Aguardando geração",
  DISPONIVEL_PARA_ASSINATURA: "Disponível para assinatura",
  ASSINADO: "Assinado",
  APROVADO_COM_OBSERVACAO: "Aprovado com observação",
  DEVOLVIDO_PARA_CORRECAO: "Devolvido para correção",
  FINALIZADO: "Finalizado",
};

export const MODELO_LABELS: Record<ModeloPulverizacao, string> = {
  NORMAL: "Normal — fila padrão",
  EMERGENCIAL: "Emergencial — prioridade CGO",
  PONTUAL: "Pontual — área localizada",
};

export function etapaColor(status: EtapaStatus): string {
  switch (status) {
    case "concluida":
      return "bg-emerald-500/20 border-emerald-500/50 text-emerald-300";
    case "em_andamento":
      return "bg-blue-500/20 border-blue-500/50 text-blue-200";
    case "atencao":
      return "bg-amber-500/20 border-amber-500/50 text-amber-200";
    case "bloqueada":
      return "bg-rose-500/20 border-rose-500/50 text-rose-200";
    default:
      return "bg-slate-700/40 border-slate-600 text-slate-400";
  }
}

export function modeloBadgeClass(m: ModeloPulverizacao): string {
  if (m === "EMERGENCIAL") return "bg-rose-950/60 text-rose-300 border-rose-700";
  if (m === "PONTUAL") return "bg-amber-950/60 text-amber-200 border-amber-700";
  return "bg-slate-800 text-slate-200 border-slate-600";
}
