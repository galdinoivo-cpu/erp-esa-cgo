import type { OperationInstance, TaskInstance, TrafficStatus } from "@/types";

export function computeTaskTraffic(task: TaskInstance, now: Date): TrafficStatus {
  if (task.status === "concluido") return "verde";
  if (task.isBlocked) return "vermelho";
  if (task.checklistDivergence === "critica") return "vermelho";
  if (task.documentBlocks) return "vermelho";
  const t = now.getTime();
  if (task.completedAt) return "verde";
  const y = new Date(task.yellowAt).getTime();
  const r = new Date(task.redAt).getTime();
  if (t < y) return "verde";
  if (t < r) return "amarelo";
  return "vermelho";
}

export function applyDocumentPendency(
  base: TrafficStatus,
  task: TaskInstance,
  now: Date
): TrafficStatus {
  if (base === "vermelho") return "vermelho";
  if (task.documentBlocks) return "vermelho";
  if (task.documentPending && now.getTime() < new Date(task.redAt).getTime()) {
    if (base === "verde") return "amarelo";
  }
  if (task.checklistDivergence === "corrigivel") {
    if (base === "verde") return "amarelo";
  }
  return base;
}

export function taskEffectiveTraffic(task: TaskInstance, now: Date): TrafficStatus {
  const raw = computeTaskTraffic(task, now);
  return applyDocumentPendency(raw, task, now);
}

export function aggregateOperationTraffic(
  tasks: TaskInstance[],
  now: Date
): TrafficStatus {
  if (!tasks.length) return "verde";
  const levels: TrafficStatus[] = tasks.map((t) => taskEffectiveTraffic(t, now));
  if (levels.includes("vermelho")) return "vermelho";
  if (levels.includes("amarelo")) return "amarelo";
  return "verde";
}

export function operationShouldHoldRadarForRed(op: OperationInstance): boolean {
  return op.criticalRadarHold && op.traffic === "vermelho" && !op.radarDismissed;
}
