import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CalendarClock,
  TriangleAlert,
  Siren,
  OctagonX,
  ClockAlert,
  Warehouse,
  Wrench,
  FileClock,
  Receipt,
} from "lucide-react";
import type { OperationInstance, TaskInstance } from "@/types";
import { isOnAgenda, isOperationTerminal, isVisibleOnRadar } from "@/domain/radarRules";
import { taskEffectiveTraffic } from "@/domain/statusEngine";

export type CgoDashboardCardId =
  | "operacoes_andamento"
  | "operacoes_planejadas"
  | "operacoes_alerta"
  | "operacoes_emergenciais"
  | "operacoes_bloqueadas"
  | "tarefas_atrasadas"
  | "colrs_pendencia"
  | "manutencao_critica"
  | "laudos_pendentes"
  | "financeiro_travando";

export type CgoCardColor = "verde" | "azul" | "amarelo" | "vermelho" | "vermelho_laranja" | "cinza";

export interface CgoCardHelp {
  significado: string;
  acao: string;
  verde: string;
  amarelo: string;
  vermelho: string;
  cinza: string;
}

export interface CgoDashboardCardConfig {
  id: CgoDashboardCardId;
  titulo: string;
  icone: LucideIcon;
  cor: CgoCardColor;
  descricao: string;
  help: CgoCardHelp;
}

export const CGO_DASHBOARD_CARDS: CgoDashboardCardConfig[] = [
  {
    id: "operacoes_andamento",
    titulo: "Operações em andamento",
    icone: Activity,
    cor: "verde",
    descricao: "Operações autorizadas, em deslocamento, na fazenda ou em execução.",
    help: {
      significado: "Mostra operações já autorizadas e em execução operacional.",
      acao: "Acompanhar progresso, previsão de término e ocorrências.",
      verde: "Execução dentro do prazo e sem pendências críticas.",
      amarelo: "Pequeno desvio ou documentação pendente corrigível.",
      vermelho: "Parada crítica ou bloqueio em campo.",
      cinza: "Ainda não autorizada para execução.",
    },
  },
  {
    id: "operacoes_planejadas",
    titulo: "Operações planejadas",
    icone: CalendarClock,
    cor: "azul",
    descricao: "Operações programadas, ainda não iniciadas, aguardando data/hora de execução.",
    help: {
      significado: "Mostra operações programadas que ainda não iniciaram.",
      acao: "Verificar agenda, COLR responsável, enxame reservado e data prevista.",
      verde: "Agenda confirmada e recursos reservados.",
      amarelo: "Risco de conflito de agenda ou recurso a confirmar.",
      vermelho: "Impossível programar sem decisão (contrato, ativo ou COLR).",
      cinza: "Sem data definida ou aguardando OSF.",
    },
  },
  {
    id: "operacoes_alerta",
    titulo: "Operações em alerta",
    icone: TriangleAlert,
    cor: "amarelo",
    descricao: "Pendências corrigíveis, atraso próximo do limite ou divergência em análise.",
    help: {
      significado: "Mostra pendências corrigíveis ou riscos de atraso.",
      acao: "Acompanhar prazo de correção e escalar se virar vermelho.",
      verde: "Sem alertas ativos.",
      amarelo: "Pendência corrigível ou prazo próximo do limite.",
      vermelho: "Escalação necessária — virou bloqueio.",
      cinza: "Operação fora da janela de monitoramento.",
    },
  },
  {
    id: "operacoes_emergenciais",
    titulo: "Operações emergenciais",
    icone: Siren,
    cor: "vermelho_laranja",
    descricao: "Prioridade operacional por urgência agronômica ou janela climática crítica.",
    help: {
      significado: "Demandas urgentes por risco agronômico ou janela operacional crítica.",
      acao: "Priorizar, avaliar remanejamento de enxames e acompanhar execução.",
      verde: "Emergência concluída ou normalizada.",
      amarelo: "Emergência em preparação com risco de atraso.",
      vermelho: "Emergência bloqueada ou sem recurso alocado.",
      cinza: "Não classificada como emergencial.",
    },
  },
  {
    id: "operacoes_bloqueadas",
    titulo: "Operações bloqueadas",
    icone: OctagonX,
    cor: "vermelho",
    descricao: "Impedidas por falha crítica, contrato, ativo indisponível ou checklist inválido.",
    help: {
      significado: "Operações impedidas de avançar.",
      acao: "Identificar motivo do bloqueio e decidir correção, substituição ou cancelamento.",
      verde: "Bloqueio resolvido.",
      amarelo: "Bloqueio parcial ou em análise de exceção.",
      vermelho: "Bloqueio crítico ativo no Radar.",
      cinza: "Sem bloqueio registrado.",
    },
  },
  {
    id: "tarefas_atrasadas",
    titulo: "Tarefas atrasadas",
    icone: ClockAlert,
    cor: "vermelho",
    descricao: "Tarefas que ultrapassaram o prazo definido pela CGO.",
    help: {
      significado: "Tarefas fora do prazo configurado.",
      acao: "Cobrar responsável, redistribuir tarefa ou abrir ocorrência.",
      verde: "Tarefa concluída no prazo.",
      amarelo: "Prazo amarelo — correção iminente.",
      vermelho: "Prazo vermelho ultrapassado.",
      cinza: "Tarefa ainda não iniciada dentro do prazo.",
    },
  },
  {
    id: "colrs_pendencia",
    titulo: "COLRs com pendência",
    icone: Warehouse,
    cor: "amarelo",
    descricao: "Centros regionais com pendências de saída, recebimento, checklist, ativos ou equipe.",
    help: {
      significado: "COLRs com problemas de checklist, recebimento, saída, ativos ou equipe.",
      acao: "Acionar gerente regional ou suporte logístico.",
      verde: "COLR regular — saída/recebimento ok.",
      amarelo: "Pendência logística ou checklist corrigível.",
      vermelho: "COLR bloqueando operação crítica.",
      cinza: "Sem movimentação no COLR.",
    },
  },
  {
    id: "manutencao_critica",
    titulo: "Manutenção crítica",
    icone: Wrench,
    cor: "vermelho",
    descricao: "Ativos bloqueados, telemetria crítica ou manutenção urgente.",
    help: {
      significado: "Robôs ou ativos bloqueados por falha técnica.",
      acao: "Acionar manutenção, substituir ativo ou reprogramar operação.",
      verde: "Ativo liberado após manutenção.",
      amarelo: "Manutenção programada ou em diagnóstico.",
      vermelho: "Ativo bloqueado — operação impactada.",
      cinza: "Sem ordem de manutenção aberta.",
    },
  },
  {
    id: "laudos_pendentes",
    titulo: "Laudos pendentes",
    icone: FileClock,
    cor: "amarelo",
    descricao: "Laudos aguardando geração, validação, assinatura do engenheiro ou correção.",
    help: {
      significado: "Laudos não assinados, não gerados ou devolvidos.",
      acao: "Cobrar assinatura, corrigir dados ou liberar revisão.",
      verde: "Laudo assinado e finalizado.",
      amarelo: "Aguardando assinatura ou validação.",
      vermelho: "Devolvido para correção ou bloqueando faturamento.",
      cinza: "Operação ainda em execução — laudo não gerado.",
    },
  },
  {
    id: "financeiro_travando",
    titulo: "Financeiro travando OSF/OCE",
    icone: Receipt,
    cor: "vermelho",
    descricao: "OSF, OP ou OCE impedida por pendência financeira, fiscal ou contratual.",
    help: {
      significado: "Ordens impedidas por contrato, pagamento, limite ou pendência financeira.",
      acao: "Acionar financeiro ou avaliar exceção autorizada.",
      verde: "Liberação financeira confirmada.",
      amarelo: "Contrato amarelo ou análise fiscal em curso.",
      vermelho: "Bloqueio financeiro ativo.",
      cinza: "Sem trava financeira registrada.",
    },
  },
];

export const CGO_CARD_BY_ID = Object.fromEntries(
  CGO_DASHBOARD_CARDS.map((c) => [c.id, c])
) as Record<CgoDashboardCardId, CgoDashboardCardConfig>;

export const CGO_COLOR_STYLES: Record<
  CgoCardColor,
  { border: string; bg: string; icon: string; badge: string }
> = {
  verde: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-950/25",
    icon: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-200",
  },
  azul: {
    border: "border-blue-500/40",
    bg: "bg-blue-950/25",
    icon: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-200",
  },
  amarelo: {
    border: "border-amber-500/40",
    bg: "bg-amber-950/20",
    icon: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-200",
  },
  vermelho: {
    border: "border-rose-500/45",
    bg: "bg-rose-950/25",
    icon: "text-rose-400",
    badge: "bg-rose-500/20 text-rose-200",
  },
  vermelho_laranja: {
    border: "border-orange-500/45",
    bg: "bg-orange-950/25",
    icon: "text-orange-400",
    badge: "bg-orange-500/20 text-orange-200",
  },
  cinza: {
    border: "border-slate-600/50",
    bg: "bg-slate-900/40",
    icon: "text-slate-400",
    badge: "bg-slate-700/40 text-slate-300",
  },
};

function isTaskOverdue(task: TaskInstance, now: Date): boolean {
  if (task.status === "concluido") return false;
  return now.getTime() > new Date(task.redAt).getTime();
}

function opTasks(tasks: TaskInstance[], opId: string): TaskInstance[] {
  return tasks.filter((t) => t.operationInstanceId === opId);
}

export function operationMatchesDashboardCard(
  op: OperationInstance,
  cardId: CgoDashboardCardId,
  now: Date,
  allTasks: TaskInstance[]
): boolean {
  if (isOperationTerminal(op)) return false;
  const onRadar = isVisibleOnRadar(op, now);
  const agenda = isOnAgenda(op, now);
  const tasks = opTasks(allTasks, op.id);
  const title = op.title.toLowerCase();
  const issue = (op.currentIssue ?? "").toLowerCase();

  switch (cardId) {
    case "operacoes_andamento":
      return (
        onRadar &&
        !agenda &&
        (op.status === "em_andamento" ||
          op.sector === "Campo" ||
          op.type === "Campo" ||
          tasks.some((t) => t.status === "em_andamento"))
      );
    case "operacoes_planejadas":
      return agenda || op.status === "programada";
    case "operacoes_alerta":
      return onRadar && op.traffic === "amarelo";
    case "operacoes_emergenciais":
      return (
        op.priority === "critica" ||
        title.includes("emergen") ||
        issue.includes("emergen") ||
        (op.group === "Peças" && op.priority === "critica")
      );
    case "operacoes_bloqueadas":
      return onRadar && (op.traffic === "vermelho" || op.status === "vermelho");
    case "tarefas_atrasadas":
      return tasks.some((t) => isTaskOverdue(t, now));
    case "colrs_pendencia":
      return (
        (op.sector === "COL" || op.group === "COL" || op.type === "COL") &&
        (onRadar || agenda) &&
        (op.traffic !== "verde" ||
          tasks.some(
            (t) =>
              t.sector === "COL" &&
              (taskEffectiveTraffic(t, now) !== "verde" || t.documentPending || t.checklistDivergence !== "nenhuma")
          ))
      );
    case "manutencao_critica":
      return (
        op.group === "Manutenção" ||
        op.sector === "Manutenção" ||
        title.includes("manuten") ||
        issue.includes("manuten") ||
        issue.includes("robô") ||
        issue.includes("robo")
      );
    case "laudos_pendentes":
      return (
        op.group === "Laudo" ||
        op.sector === "Laudo" ||
        issue.includes("laudo") ||
        tasks.some((t) => t.name.toLowerCase().includes("laudo") && t.status !== "concluido")
      );
    case "financeiro_travando":
      return (
        op.group === "Financeiro" ||
        op.sector === "Financeiro" ||
        issue.includes("financeir") ||
        issue.includes("contrato") ||
        issue.includes("fiscal") ||
        tasks.some((t) => t.documentBlocks || t.sector === "Financeiro")
      );
    default:
      return false;
  }
}

/** Operação visível no Radar para o filtro do card (inclui tarefas atrasadas via op pai). */
export function operationVisibleForCardFilter(
  op: OperationInstance,
  cardId: CgoDashboardCardId,
  now: Date,
  allTasks: TaskInstance[]
): boolean {
  if (cardId === "operacoes_planejadas") {
    return operationMatchesDashboardCard(op, cardId, now, allTasks);
  }
  if (!isVisibleOnRadar(op, now) && cardId !== "tarefas_atrasadas") {
    if (cardId === "colrs_pendencia" && isOnAgenda(op, now)) {
      return operationMatchesDashboardCard(op, cardId, now, allTasks);
    }
    return false;
  }
  return operationMatchesDashboardCard(op, cardId, now, allTasks);
}
