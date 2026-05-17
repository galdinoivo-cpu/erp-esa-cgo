import type { CgoDatabase } from "@/types";
import type { CgoDashboardCardId } from "@/domain/cgoDashboardCards";
import { CGO_DASHBOARD_CARDS, operationMatchesDashboardCard } from "@/domain/cgoDashboardCards";
import { loadPortalDb } from "@/data/portalPersistence";
import { loadOceDb } from "@/data/ocePersistence";

export type CgoDashboardCounts = Record<CgoDashboardCardId, number>;

export function computeCgoDashboardCounts(db: CgoDatabase, now: Date): CgoDashboardCounts {
  const ops = db.operationInstances;
  const tasks = db.taskInstances;

  const counts = {} as CgoDashboardCounts;
  for (const card of CGO_DASHBOARD_CARDS) {
    if (card.id === "laudos_pendentes") {
      counts[card.id] = countLaudosPendentes();
      continue;
    }
    if (card.id === "financeiro_travando") {
      counts[card.id] = countFinanceiroTravando(ops, tasks, now);
      continue;
    }
    counts[card.id] = ops.filter((op) => operationMatchesDashboardCard(op, card.id, now, tasks)).length;
  }
  return counts;
}

function countLaudosPendentes(): number {
  const portal = loadPortalDb();
  const fromPortal =
    portal?.laudos.filter(
      (l) =>
        l.status_laudo !== "ASSINADO" &&
        l.status_laudo !== "FINALIZADO" &&
        l.status_laudo !== "APROVADO_COM_OBSERVACAO"
    ).length ?? 0;
  return fromPortal;
}

function countFinanceiroTravando(
  ops: CgoDatabase["operationInstances"],
  tasks: CgoDatabase["taskInstances"],
  now: Date
): number {
  const fromOps = ops.filter((op) =>
    operationMatchesDashboardCard(op, "financeiro_travando", now, tasks)
  ).length;
  const portal = loadPortalDb();
  const osfFinanceiro =
    portal?.osfs.filter((o) => o.status === "AGUARDANDO_VALIDACAO_FINANCEIRA").length ?? 0;
  const oce = loadOceDb();
  const oceFinanceiro = oce?.oces.filter((o) => o.status === "BLOQUEADA").length ?? 0;
  return fromOps + osfFinanceiro + oceFinanceiro;
}
