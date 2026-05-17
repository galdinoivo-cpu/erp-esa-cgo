import { useState } from "react";
import ShellHeader from "@/components/ShellHeader";
import { useCgo } from "@/state/CgoContext";

type AssetState = "liberado" | "atencao" | "bloqueado";

export default function ColrManutencaoPage() {
  const { rawDb } = useCgo();
  const [states, setStates] = useState<Record<string, AssetState>>({});

  return (
    <>
      <ShellHeader title="Manutenção COLR" subtitle="Robôs e liberação técnica" />
      <main className="max-w-3xl mx-auto p-4 space-y-3">
        {rawDb.assets.map((a) => {
          const st = states[a.id] ?? (a.status === "em_campo" ? "atencao" : "liberado");
          return (
            <article key={a.id} className="rounded-xl border border-cgo-border bg-cgo-panel p-4 flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-semibold text-white">{a.name}</p>
                <p className="text-xs text-cgo-muted">
                  {a.physicalId} · {a.location}
                </p>
              </div>
              <select
                className="rounded bg-cgo-bg border border-cgo-border px-2 py-1 text-sm"
                value={st}
                onChange={(e) => setStates((s) => ({ ...s, [a.id]: e.target.value as AssetState }))}
              >
                <option value="liberado">Liberado</option>
                <option value="atencao">Em atenção</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </article>
          );
        })}
        <button
          type="button"
          className="text-sm text-cgo-accent underline"
          onClick={() => alert("Ocorrência técnica registrada (protótipo).")}
        >
          Abrir ocorrência técnica
        </button>
      </main>
    </>
  );
}
