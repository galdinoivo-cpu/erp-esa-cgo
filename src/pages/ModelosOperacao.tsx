import { Link } from "react-router-dom";
import { useCgo } from "@/state/CgoContext";

export default function ModelosOperacao() {
  const { rawDb } = useCgo();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Modelos de operação</h1>
      <p className="text-cgo-muted text-sm">
        Lista compacta. Para editar prazos, flags e duplicar, use{" "}
        <Link to="/config" className="text-cgo-accent hover:underline">
          Configuração CGO
        </Link>
        .
      </p>
      <ul className="space-y-2">
        {rawDb.operationTemplates.map((t) => (
          <li key={t.id} className="rounded-lg border border-cgo-border bg-cgo-panel px-4 py-3 flex justify-between">
            <div>
              <div className="font-medium text-white">{t.name}</div>
              <div className="text-xs text-cgo-muted">
                {t.group} · {t.type} · {t.isActive ? "ativo" : "inativo"}
              </div>
            </div>
            <code className="text-[10px] text-cgo-muted self-center">{t.id}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
