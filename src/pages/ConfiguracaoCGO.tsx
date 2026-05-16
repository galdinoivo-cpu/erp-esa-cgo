import { useMemo, useState, type FormEvent } from "react";
import type { OperationTemplate } from "@/types";
import { useCgo } from "@/state/CgoContext";
import { GROUPS } from "@/constants";

const emptyDuration = () => ({ value: 24, unit: "hours" as const });

export default function ConfiguracaoCGO() {
  const {
    rawDb,
    upsertOperationTemplate,
    duplicateOperationTemplate,
    setTemplateActive,
    resetSeed,
    exportJson,
    importJsonFile,
  } = useCgo();
  const [editing, setEditing] = useState<OperationTemplate | null>(null);

  const sorted = useMemo(
    () => [...rawDb.operationTemplates].sort((a, b) => a.name.localeCompare(b.name)),
    [rawDb.operationTemplates]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Configuração CGO</h1>
          <p className="text-cgo-muted text-sm mt-1">Modelos de operação parametrizados (JSON / localStorage).</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-cgo-border px-3 py-1.5 text-sm hover:bg-white/5"
            onClick={() => {
              const blob = new Blob([exportJson()], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `cgo-backup-${Date.now()}.json`;
              a.click();
            }}
          >
            Exportar JSON
          </button>
          <label className="rounded-md border border-cgo-border px-3 py-1.5 text-sm hover:bg-white/5 cursor-pointer">
            Importar JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                f.text().then(importJsonFile).catch(alert);
                e.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            className="rounded-md bg-rose-900/40 border border-rose-800/50 px-3 py-1.5 text-sm"
            onClick={() => {
              if (confirm("Repor dados de demonstração?")) resetSeed();
            }}
          >
            Repor seed
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-cgo-border">
        <table className="w-full text-sm">
          <thead className="bg-cgo-panel text-left text-xs text-cgo-muted uppercase">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Grupo</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Radar (−Δ)</th>
              <th className="p-3">Ativo</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((tpl) => (
              <tr key={tpl.id} className="border-t border-cgo-border hover:bg-white/5">
                <td className="p-3 font-medium text-white">{tpl.name}</td>
                <td className="p-3">{tpl.group}</td>
                <td className="p-3">{tpl.type}</td>
                <td className="p-3 text-xs">
                  {tpl.radarLeadBeforeStart.value} {tpl.radarLeadBeforeStart.unit}
                </td>
                <td className="p-3">{tpl.isActive ? "sim" : "não"}</td>
                <td className="p-3 text-right space-x-2 whitespace-nowrap">
                  <button type="button" className="text-cgo-accent hover:underline" onClick={() => setEditing(tpl)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="text-slate-300 hover:underline"
                    onClick={() => duplicateOperationTemplate(tpl.id)}
                  >
                    Duplicar
                  </button>
                  <button
                    type="button"
                    className="text-slate-300 hover:underline"
                    onClick={() => setTemplateActive(tpl.id, !tpl.isActive)}
                  >
                    {tpl.isActive ? "Inativar" : "Ativar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        className="rounded-md bg-cgo-accent px-4 py-2 text-sm font-medium text-white"
        onClick={() => {
          const id = `tpl-${crypto.randomUUID().slice(0, 8)}`;
          const t: OperationTemplate = {
            id,
            name: "Nova operação",
            group: "COL",
            type: "Interno",
            description: "",
            defaultOwnerRole: "CGO",
            defaultSector: "COL",
            defaultLocation: "COL",
            triggerType: "Manual",
            normalTimeLimit: emptyDuration(),
            yellowTimeLimit: { value: 12, unit: "hours" },
            redTimeLimit: { value: 24, unit: "hours" },
            radarLeadBeforeStart: { value: 24, unit: "hours" },
            requiresChecklist: false,
            requiresPhysicalReading: false,
            requiresDocument: false,
            requiresCGOApproval: false,
            requiresReport: false,
            blocksNextStep: false,
            escalatesToCGO: true,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          upsertOperationTemplate(t);
          setEditing(t);
        }}
      >
        Criar nova operação
      </button>

      {editing && (
        <EditTemplateModal tpl={editing} onClose={() => setEditing(null)} onSave={upsertOperationTemplate} />
      )}
    </div>
  );
}

function EditTemplateModal({
  tpl,
  onClose,
  onSave,
}: {
  tpl: OperationTemplate;
  onClose: () => void;
  onSave: (t: OperationTemplate) => void;
}) {
  const [form, setForm] = useState<OperationTemplate>({ ...tpl });

  function save(e: FormEvent) {
    e.preventDefault();
    onSave({ ...form, updatedAt: new Date().toISOString() });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <form
        onSubmit={save}
        className="w-full max-w-2xl rounded-xl border border-cgo-border bg-cgo-panel max-h-[90vh] overflow-y-auto p-4 space-y-3"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Editar modelo</h2>
          <button type="button" onClick={onClose} className="text-cgo-muted">
            ✕
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <LabeledInput label="ID" value={form.id} readOnly />
          <LabeledInput
            label="Nome"
            value={form.name}
            onChange={(name) => setForm((f) => ({ ...f, name }))}
            required
          />
          <LabeledSelect
            label="Grupo"
            value={form.group}
            onChange={(group) => setForm((f) => ({ ...f, group }))}
            options={[...GROUPS]}
          />
          <LabeledInput label="Tipo" value={form.type} onChange={(type) => setForm((f) => ({ ...f, type }))} />
          <div className="md:col-span-2">
            <LabeledInput
              label="Descrição"
              value={form.description}
              onChange={(description) => setForm((f) => ({ ...f, description }))}
            />
          </div>
          <LabeledInput
            label="Responsável principal (papel)"
            value={form.defaultOwnerRole}
            onChange={(defaultOwnerRole) => setForm((f) => ({ ...f, defaultOwnerRole }))}
          />
          <LabeledInput
            label="Setor responsável"
            value={form.defaultSector}
            onChange={(defaultSector) => setForm((f) => ({ ...f, defaultSector }))}
          />
          <LabeledInput
            label="Local padrão"
            value={form.defaultLocation}
            onChange={(defaultLocation) => setForm((f) => ({ ...f, defaultLocation }))}
          />
          <LabeledInput
            label="Gatilho de abertura"
            value={form.triggerType}
            onChange={(triggerType) => setForm((f) => ({ ...f, triggerType }))}
          />
          <DurationField
            label="Prazo normal"
            value={form.normalTimeLimit}
            onChange={(normalTimeLimit) => setForm((f) => ({ ...f, normalTimeLimit }))}
          />
          <DurationField
            label="Amarelo após"
            value={form.yellowTimeLimit}
            onChange={(yellowTimeLimit) => setForm((f) => ({ ...f, yellowTimeLimit }))}
          />
          <DurationField
            label="Vermelho após"
            value={form.redTimeLimit}
            onChange={(redTimeLimit) => setForm((f) => ({ ...f, redTimeLimit }))}
          />
          <DurationField
            label="Entrada no Radar (antes do marco)"
            value={form.radarLeadBeforeStart}
            onChange={(radarLeadBeforeStart) => setForm((f) => ({ ...f, radarLeadBeforeStart }))}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-2 text-xs">
          <BoolRow v={form.requiresChecklist} on={(requiresChecklist) => setForm((f) => ({ ...f, requiresChecklist }))}>
            Exige checklist?
          </BoolRow>
          <BoolRow
            v={form.requiresPhysicalReading}
            on={(requiresPhysicalReading) => setForm((f) => ({ ...f, requiresPhysicalReading }))}
          >
            Exige leitura física?
          </BoolRow>
          <BoolRow v={form.requiresDocument} on={(requiresDocument) => setForm((f) => ({ ...f, requiresDocument }))}>
            Exige documento?
          </BoolRow>
          <BoolRow
            v={form.requiresCGOApproval}
            on={(requiresCGOApproval) => setForm((f) => ({ ...f, requiresCGOApproval }))}
          >
            Exige aprovação CGO?
          </BoolRow>
          <BoolRow v={form.requiresReport} on={(requiresReport) => setForm((f) => ({ ...f, requiresReport }))}>
            Exige laudo?
          </BoolRow>
          <BoolRow v={form.blocksNextStep} on={(blocksNextStep) => setForm((f) => ({ ...f, blocksNextStep }))}>
            Bloqueia próxima etapa?
          </BoolRow>
          <BoolRow v={form.escalatesToCGO} on={(escalatesToCGO) => setForm((f) => ({ ...f, escalatesToCGO }))}>
            Sobe p/ CGO automaticamente?
          </BoolRow>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" className="flex-1 border border-cgo-border rounded-md py-2" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="flex-1 bg-cgo-accent rounded-md py-2 text-white font-medium">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  readOnly,
  required,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-cgo-muted">{label}</span>
      <input
        readOnly={readOnly}
        required={required}
        className="w-full rounded-md bg-cgo-bg border border-cgo-border px-2 py-1.5 read-only:opacity-70"
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
    </label>
  );
}

function LabeledSelect({
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
    <label className="block space-y-1">
      <span className="text-xs text-cgo-muted">{label}</span>
      <select
        className="w-full rounded-md bg-cgo-bg border border-cgo-border px-2 py-1.5"
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

function DurationField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: OperationTemplate["normalTimeLimit"];
  onChange: (v: OperationTemplate["normalTimeLimit"]) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-cgo-muted">{label}</span>
      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          className="w-24 rounded-md bg-cgo-bg border border-cgo-border px-2 py-1.5"
          value={value.value}
          onChange={(e) => onChange({ ...value, value: Number(e.target.value) })}
        />
        <select
          className="flex-1 rounded-md bg-cgo-bg border border-cgo-border px-2 py-1.5"
          value={value.unit}
          onChange={(e) =>
            onChange({ ...value, unit: e.target.value as OperationTemplate["normalTimeLimit"]["unit"] })
          }
        >
          <option value="minutes">minutos</option>
          <option value="hours">horas</option>
          <option value="days">dias</option>
        </select>
      </div>
    </label>
  );
}

function BoolRow({ children, v, on }: { children: string; v: boolean; on: (b: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={v} onChange={(e) => on(e.target.checked)} />
      {children}
    </label>
  );
}
