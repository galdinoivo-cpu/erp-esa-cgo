import type { OceStatus } from "@/types/oce";
import { trafficForOceStatus } from "@/domain/oceRules";

export default function OceStatusBadge({ status }: { status: OceStatus }) {
  const t = trafficForOceStatus(status);
  const cls =
    t === "verde"
      ? "bg-emerald-900/50 text-emerald-200 border-emerald-700"
      : t === "amarelo"
        ? "bg-amber-900/50 text-amber-200 border-amber-700"
        : "bg-rose-900/50 text-rose-200 border-rose-700";
  return (
    <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${cls}`}>{status.replace(/_/g, " ")}</span>
  );
}
