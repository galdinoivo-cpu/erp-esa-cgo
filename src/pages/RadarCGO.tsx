import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { OperationInstance, TrafficStatus } from "@/types";
import { useCgo } from "@/state/CgoContext";
import { isVisibleOnRadar } from "@/domain/radarRules";
import {
  CGO_CARD_BY_ID,
  operationVisibleForCardFilter,
  type CgoDashboardCardId,
} from "@/domain/cgoDashboardCards";
import { formatDateTime, formatRemaining } from "@/domain/time";
import DecisionModal from "@/components/DecisionModal";

type Filter = {
  group: string;
  traffic: TrafficStatus | "todos";
  region: string;
  col: string;
  owner: string;
};

export default function RadarCGO() {
  const { dbView, now } = useCgo();
  const [searchParams, setSearchParams] = useSearchParams();
  const cardRaw = searchParams.get("card");
  const activeCard: CgoDashboardCardId | null =
    cardRaw && cardRaw in CGO_CARD_BY_ID ? (cardRaw as CgoDashboardCardId) : null;
  const cardConfig = activeCard ? CGO_CARD_BY_ID[activeCard] : null;

  const [f, setF] = useState<Filter>({
    group: "todos",
    traffic: "todos",
    region: "todos",
    col: "todos",
    owner: "todos",
  });
  const [decisionOp, setDecisionOp] = useState<OperationInstance | null>(null);

  const radarOps = useMemo(() => {
    const tasks = dbView.taskInstances;
    if (activeCard === "operacoes_planejadas") {
      return dbView.operationInstances.filter((o) =>
        operationVisibleForCardFilter(o, activeCard, now, tasks)
      );
    }
    if (activeCard) {
      return dbView.operationInstances.filter(
        (o) =>
          operationVisibleForCardFilter(o, activeCard, now, tasks) &&
          (isVisibleOnRadar(o, now) || activeCard === "tarefas_atrasadas")
      );
    }
    return dbView.operationInstances.filter((o) => isVisibleOnRadar(o, now));
  }, [dbView, now, activeCard]);

  const filtered = useMemo(() => {
    const tasks = dbView.taskInstances;
    return radarOps.filter((o) => {
      if (activeCard && !operationVisibleForCardFilter(o, activeCard, now, tasks)) return false;
      if (f.group !== "todos" && o.group !== f.group) return false;
      if (f.traffic !== "todos" && o.traffic !== f.traffic) return false;
      if (f.region !== "todos" && o.region !== f.region) return false;
      if (f.col !== "todos" && o.col !== f.col) return false;
      if (f.owner !== "todos" && o.currentOwner !== f.owner) return false;
      return true;
    });
  }, [radarOps, f, activeCard, dbView.taskInstances, now]);

  const stats = useMemo(() => {
    const g = radarOps.filter((o) => o.traffic === "verde").length;
    const y = radarOps.filter((o) => o.traffic === "amarelo").length;
    const r = radarOps.filter((o) => o.traffic === "vermelho").length;
    const crit = radarOps.filter((o) => o.priority === "critica").length;
    const t24 = now.getTime() + 24 * 3600000;
    const enteringSoon = dbView.operationInstances.filter((o) => {
      if (o.cancelled || o.archived) return false;
      const re = new Date(o.radarEntryAt).getTime();
      return re > now.getTime() && re <= t24;
    }).length;
    return { total: radarOps.length, g, y, r, crit, enteringSoon };
  }, [radarOps, dbView, now]);

  const groups = useMemo(() => {
    const s = new Set(radarOps.map((o) => o.group));
    return ["todos", ...s];
  }, [radarOps]);

  const owners = useMemo(() => {
    const s = new Set(radarOps.map((o) => o.currentOwner));
    return ["todos", ...s];
  }, [radarOps]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Radar CGO</h1>
        <p className="text-cgo-muted text-sm mt-1">
          Operações dentro da janela de monitoramento ou com permanência crítica no Radar.
        </p>
        {cardConfig && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-cgo-accent/40 bg-cgo-accent/10 px-3 py-2 text-sm">
            <span className="text-white">
              Filtro do Dashboard: <strong>{cardConfig.titulo}</strong>
            </span>
            <button
              type="button"
              className="text-xs text-cgo-accent underline"
              onClick={() => setSearchParams({})}
            >
              Limpar filtro
            </button>
            <Link to="/cgo/help" className="text-xs text-cgo-muted hover:text-white underline">
              Ajuda
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MiniStat label="Em andamento / Radar" value={stats.total} />
        <MiniStat label="Verde" value={stats.g} className="border-l-4 border-cgo-good" />
        <MiniStat label="Amarelo" value={stats.y} className="border-l-4 border-cgo-warn" />
        <MiniStat label="Vermelho" value={stats.r} className="border-l-4 border-cgo-bad" />
        <MiniStat label="Críticas" value={stats.crit} />
        <MiniStat label="Entram 24h" value={stats.enteringSoon} />
      </div>

      <div className="flex flex-wrap gap-3 items-end rounded-lg border border-cgo-border bg-cgo-panel p-4">
        <Select
          label="Grupo"
          value={f.group}
          onChange={(group) => setF((x) => ({ ...x, group }))}
          options={groups}
        />
        <Select
          label="Status"
          value={f.traffic}
          onChange={(traffic) => setF((x) => ({ ...x, traffic: traffic as Filter["traffic"] }))}
          options={["todos", "verde", "amarelo", "vermelho"]}
        />
        <Select
          label="Região"
          value={f.region}
          onChange={(region) => setF((x) => ({ ...x, region }))}
          options={["todos", "Bahia", "Mato Grosso do Sul", "Santa Catarina", "Outro"]}
        />
        <Select
          label="COL"
          value={f.col}
          onChange={(col) => setF((x) => ({ ...x, col }))}
          options={["todos", "COL Bahia", "COL MS", "COL SC", "N/A"]}
        />
        <Select
          label="Responsável"
          value={f.owner}
          onChange={(owner) => setF((x) => ({ ...x, owner }))}
          options={owners}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-cgo-border p-8 text-center text-cgo-muted">
          Nenhuma operação no Radar com os filtros atuais.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((op) => (
            <article
              key={op.id}
              className={`rounded-xl border bg-cgo-panel overflow-hidden shadow-lg ${
                op.traffic === "verde"
                  ? "border-cgo-good/50"
                  : op.traffic === "amarelo"
                    ? "border-cgo-warn/60"
                    : "border-cgo-bad/60"
              }`}
            >
              <div
                className={`h-1.5 ${
                  op.traffic === "verde" ? "bg-cgo-good" : op.traffic === "amarelo" ? "bg-cgo-warn" : "bg-cgo-bad"
                }`}
              />
              <div className="p-4 space-y-2">
                <div className="flex justify-between gap-2">
                  <h2 className="font-semibold text-white leading-snug">{op.title}</h2>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white/10 text-cgo-muted shrink-0">
                    {op.traffic}
                  </span>
                </div>
                <div className="text-xs text-cgo-muted flex flex-wrap gap-x-3 gap-y-1">
                  <span>{op.group}</span>
                  <span>{op.col}</span>
                  <span>{op.region}</span>
                </div>
                <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                  <Dt>Cliente</Dt>
                  <Dd>{op.clientName}</Dd>
                  <Dt>Fazenda</Dt>
                  <Dd>{op.farmName}</Dd>
                  <Dt>Talhão</Dt>
                  <Dd>{op.fieldName}</Dd>
                  <Dt>Responsável</Dt>
                  <Dd>{op.currentOwner}</Dd>
                  <Dt>Setor</Dt>
                  <Dd>{op.sector}</Dd>
                  <Dt>Programado</Dt>
                  <Dd>{formatDateTime(op.scheduledStart)}</Dd>
                  <Dt>Até fim</Dt>
                  <Dd>{formatRemaining(op.scheduledEnd, now)}</Dd>
                  <Dt>Última atualização</Dt>
                  <Dd>{formatDateTime(op.updatedAt)}</Dd>
                </dl>
                <div className="text-xs">
                  <span className="text-cgo-muted">Pendência: </span>
                  <span className="text-slate-200">{op.currentIssue || "—"}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    className="flex-1 rounded-md border border-cgo-border px-3 py-1.5 text-xs hover:bg-white/5"
                    onClick={() => alert(`Detalhe MVP: operação ${op.id}\nAbrir painel completo na v2.`)}
                  >
                    Ver detalhes
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-md bg-cgo-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
                    onClick={() => setDecisionOp(op)}
                  >
                    Decisão CGO
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {decisionOp && (
        <DecisionModal operation={decisionOp} onClose={() => setDecisionOp(null)} />
      )}
    </div>
  );
}

function MiniStat({ label, value, className = "" }: { label: string; value: number; className?: string }) {
  return (
    <div className={`rounded-lg border border-cgo-border bg-cgo-panel p-3 pl-3 ${className}`}>
      <div className="text-xs text-cgo-muted">{label}</div>
      <div className="text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="text-xs text-cgo-muted flex flex-col gap-1 min-w-[140px]">
      {label}
      <select
        className="rounded-md bg-cgo-bg border border-cgo-border px-2 py-1.5 text-sm text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Dt({ children }: { children: string }) {
  return <dt className="text-cgo-muted">{children}</dt>;
}
function Dd({ children }: { children: string }) {
  return <dd className="text-slate-100 font-medium">{children}</dd>;
}
