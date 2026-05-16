import { useCgo } from "@/state/CgoContext";

export default function ChecklistsPage() {
  const { rawDb } = useCgo();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Checklists</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {rawDb.checklistTemplates.map((c) => (
          <div key={c.id} className="rounded-lg border border-cgo-border bg-cgo-panel p-4">
            <h2 className="font-semibold text-white">{c.name}</h2>
            <p className="text-xs text-cgo-muted mt-1">{c.description}</p>
            <p className="text-xs mt-2">Leitura física: {c.requiresPhysicalReading ? "sim" : "não"}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {rawDb.checklistItems
                .filter((i) => i.checklistTemplateId === c.id)
                .map((i) => (
                  <li key={i.id} className="flex gap-2">
                    <span className="text-cgo-muted">{i.required ? "*" : "○"}</span>
                    {i.description}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
