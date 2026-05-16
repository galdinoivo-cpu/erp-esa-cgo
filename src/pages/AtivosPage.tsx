import { useCgo } from "@/state/CgoContext";

export default function AtivosPage() {
  const { rawDb } = useCgo();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Ativos</h1>
      <div className="overflow-x-auto rounded-lg border border-cgo-border text-sm">
        <table className="w-full">
          <thead className="bg-cgo-panel text-left text-xs text-cgo-muted uppercase">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">ID físico</th>
              <th className="p-3">Status</th>
              <th className="p-3">Local</th>
            </tr>
          </thead>
          <tbody>
            {rawDb.assets.map((a) => (
              <tr key={a.id} className="border-t border-cgo-border">
                <td className="p-3 font-medium text-white">{a.name}</td>
                <td className="p-3">{a.type}</td>
                <td className="p-3 font-mono text-xs">{a.physicalId}</td>
                <td className="p-3">{a.status}</td>
                <td className="p-3">{a.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
