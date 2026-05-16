import type { OperationInstance, TaskInstance } from "@/types";
import {
  aggregateOperationTraffic,
  operationShouldHoldRadarForRed,
  taskEffectiveTraffic,
} from "./statusEngine";

const terminal = new Set(["concluido", "cancelado", "arquivado"]);

export function isOperationTerminal(op: OperationInstance): boolean {
  if (op.cancelled || op.archived) return true;
  return terminal.has(op.status);
}

export function isOnAgenda(op: OperationInstance, now: Date): boolean {
  if (isOperationTerminal(op)) return false;
  return now.getTime() < new Date(op.radarEntryAt).getTime();
}

export function isVisibleOnRadar(op: OperationInstance, now: Date): boolean {
  if (isOperationTerminal(op)) return false;
  if (op.radarDismissed) return false;
  const entered = now.getTime() >= new Date(op.radarEntryAt).getTime();
  if (isOnAgenda(op, now) && !op.isOnRadar) return false;
  if (entered || op.isOnRadar) {
    if (op.status === "concluido" || op.closedAt) return false;
    if (operationShouldHoldRadarForRed(op)) return true;
    if (op.traffic === "vermelho" && op.criticalRadarHold) return true;
    return true;
  }
  return false;
}

export function syncOperationRadarAndTraffic(
  op: OperationInstance,
  taskList: TaskInstance[],
  now: Date
): { op: OperationInstance; tasks: TaskInstance[] } {
  const tasks = taskList.map((t) => ({
    ...t,
    traffic: taskEffectiveTraffic(t, now),
    updatedAt: now.toISOString(),
  }));

  const traffic = aggregateOperationTraffic(tasks, now);
  const entered = now.getTime() >= new Date(op.radarEntryAt).getTime();
  let isOnRadar = op.isOnRadar;
  if (!isOperationTerminal(op)) {
    if (op.radarDismissed) {
      isOnRadar = false;
    } else if (entered) {
      isOnRadar = true;
    }
    if (traffic === "vermelho" && op.criticalRadarHold && !op.radarDismissed) {
      isOnRadar = true;
    }
    if (op.status === "concluido" || op.closedAt) isOnRadar = false;
  } else {
    isOnRadar = false;
  }

  let status = op.status;
  if (!isOperationTerminal(op)) {
    if (isOnAgenda(op, now) && op.status === "programada") {
      status = "programada";
    } else {
      if (traffic === "vermelho") status = "vermelho";
      else if (traffic === "amarelo") status = "amarelo";
      else if (traffic === "verde") status = "em_andamento";
    }
  }

  return {
    op: {
      ...op,
      traffic,
      isOnRadar,
      status,
      updatedAt: now.toISOString(),
    },
    tasks,
  };
}

export function syncDatabaseView(
  ops: OperationInstance[],
  tasks: TaskInstance[],
  now: Date
): { ops: OperationInstance[]; tasks: TaskInstance[] } {
  const taskByOp = new Map<string, TaskInstance[]>();
  for (const t of tasks) {
    const arr = taskByOp.get(t.operationInstanceId) ?? [];
    arr.push(t);
    taskByOp.set(t.operationInstanceId, arr);
  }
  const nextTasks: TaskInstance[] = [];
  const nextOps = ops.map((op) => {
    const ts = taskByOp.get(op.id) ?? [];
    const { op: o2, tasks: t2 } = syncOperationRadarAndTraffic(op, ts, now);
    nextTasks.push(...t2);
    return o2;
  });
  return { ops: nextOps, tasks: nextTasks };
}
