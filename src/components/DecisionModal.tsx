import { useState, type FormEvent, type ReactNode } from "react";
import type { OperationInstance } from "@/types";
import { useCgo } from "@/state/CgoContext";
import { DECISION_TYPES } from "@/constants";
import { formatDateTime } from "@/domain/time";

export default function DecisionModal({
  operation,
  onClose,
}: {
  operation: OperationInstance;
  onClose: () => void;
}) {
  const { registerDecision, currentUserId, dismissRadar } = useCgo();
  const [decisionType, setDecisionType] = useState<string>(DECISION_TYPES[0]);
  const [instruction, setInstruction] = useState("");
  const [assignedTo, setAssignedTo] = useState(operation.currentOwner);
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 24);
    return d.toISOString().slice(0, 16);
  });
  const [justification, setJustification] = useState("");
  const [impact, setImpact] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    registerDecision({
      operationInstanceId: operation.id,
      taskInstanceId: null,
      decisionType,
      instruction,
      assignedTo,
      deadline: new Date(deadline).toISOString(),
      justification,
      impact,
      userId: currentUserId,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-cgo-border bg-cgo-panel shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-cgo-border flex justify-between items-start gap-2">
          <div>
            <h2 className="text-lg font-semibold text-white">Registrar decisão CGO</h2>
            <p className="text-xs text-cgo-muted mt-1">{operation.title}</p>
          </div>
          <button type="button" className="text-cgo-muted hover:text-white" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-3">
          <Field label="Tipo de decisão">
            <select
              required
              className="w-full rounded-md bg-cgo-bg border border-cgo-border px-3 py-2 text-sm"
              value={decisionType}
              onChange={(e) => setDecisionType(e.target.value)}
            >
              {DECISION_TYPES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Orientação">
            <textarea
              required
              className="w-full rounded-md bg-cgo-bg border border-cgo-border px-3 py-2 text-sm min-h-[72px]"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Instrução objetiva para o setor executor"
            />
          </Field>
          <Field label="Responsável por executar">
            <input
              required
              className="w-full rounded-md bg-cgo-bg border border-cgo-border px-3 py-2 text-sm"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
          </Field>
          <Field label="Prazo para execução">
            <input
              type="datetime-local"
              required
              className="w-full rounded-md bg-cgo-bg border border-cgo-border px-3 py-2 text-sm"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <p className="text-[10px] text-cgo-muted mt-1">Armazenado em ISO a partir do valor local.</p>
          </Field>
          <Field label="Justificativa">
            <textarea
              required
              className="w-full rounded-md bg-cgo-bg border border-cgo-border px-3 py-2 text-sm min-h-[56px]"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </Field>
          <Field label="Impacto esperado">
            <input
              className="w-full rounded-md bg-cgo-bg border border-cgo-border px-3 py-2 text-sm"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              placeholder="Opcional"
            />
          </Field>
          <div className="text-xs text-cgo-muted">
            Usuário CGO: <span className="text-slate-200">{currentUserId}</span> ·{" "}
            {formatDateTime(new Date().toISOString())}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              className="flex-1 rounded-md border border-cgo-border py-2 text-sm"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="flex-1 rounded-md bg-cgo-accent py-2 text-sm font-medium text-white">
              Guardar decisão
            </button>
          </div>
          {operation.traffic === "vermelho" && (
            <button
              type="button"
              className="w-full rounded-md border border-rose-800/60 text-rose-300 py-2 text-xs hover:bg-rose-950/40"
              onClick={() => {
                dismissRadar(operation.id);
                onClose();
              }}
            >
              Dispensar do Radar após tratativa
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs text-cgo-muted space-y-1">
      <span>{label}</span>
      {children}
    </label>
  );
}
