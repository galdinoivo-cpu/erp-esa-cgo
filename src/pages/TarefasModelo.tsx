import { useMemo } from "react";
import { useCgo } from "@/state/CgoContext";

export default function TarefasModelo() {
  const { rawDb } = useCgo();
  const rows = useMemo(() => {
    return [...rawDb.taskTemplates].sort((a, b) => {
      const oa = rawDb.operationTemplates.find((o) => o.id === a.operationTemplateId)?.name ?? "";
      const ob = rawDb.operationTemplates.find((o) => o.id === b.operationTemplateId)?.name ?? "";
      if (oa !== ob) return oa.localeCompare(ob);
      return a.sequence - b.sequence;
    });
  }, [rawDb.taskTemplates, rawDb.operationTemplates]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Tarefas (modelo)</h1>
      <p className="text-cgo-muted text-sm">Tarefas vinculadas a modelos de operação.</p>
      <div className="overflow-x-auto rounded-lg border border-cgo-border text-sm">
        <table className="w-full">
          <thead className="bg-cgo-panel text-left text-xs text-cgo-muted uppercase">
            <tr>
              <th className="p-3">Operação</th>
              <th className="p-3">Tarefa</th>
              <th className="p-3">Seq</th>
              <th className="p-3">Setor</th>
              <th className="p-3">Depende anterior</th>
              <th className="p-3">Regra encerramento</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t border-cgo-border">
                <td className="p-3 text-cgo-muted">
                  {rawDb.operationTemplates.find((o) => o.id === t.operationTemplateId)?.name}
                </td>
                <td className="p-3 text-white font-medium">{t.name}</td>
                <td className="p-3">{t.sequence}</td>
                <td className="p-3">{t.sector}</td>
                <td className="p-3">{t.dependsOnPreviousTask ? "sim" : "não"}</td>
                <td className="p-3 text-xs text-cgo-muted max-w-xs">{t.closingRule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
