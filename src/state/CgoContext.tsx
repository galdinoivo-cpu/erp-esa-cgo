import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AuditLog,
  CGODecision,
  CgoDatabase,
  OperationTemplate,
  TaskTemplate,
} from "@/types";
import { createSeedDatabase } from "@/data/bootstrapDb";
import { exportDbJson, importDbJson, loadDb, saveDb } from "@/data/persistence";
import { syncDatabaseView } from "@/domain/radarRules";

const TICK_MS = 30_000;

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

type CgoContextValue = {
  now: Date;
  setClockOffsetMinutes: (m: number) => void;
  advanceClockHours: (h: number) => void;
  resetClock: () => void;
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  rawDb: CgoDatabase;
  dbView: CgoDatabase;
  refresh: () => void;
  resetSeed: () => void;
  exportJson: () => string;
  importJsonFile: (text: string) => void;
  appendLog: (entry: Omit<AuditLog, "id" | "createdAt"> & { createdAt?: string }) => void;
  registerDecision: (
    partial: Omit<CGODecision, "id" | "createdAt"> & { createdAt?: string }
  ) => void;
  dismissRadar: (operationId: string) => void;
  upsertOperationTemplate: (tpl: OperationTemplate) => void;
  upsertTaskTemplate: (t: TaskTemplate) => void;
  duplicateOperationTemplate: (id: string) => void;
  setTemplateActive: (id: string, isActive: boolean) => void;
};

const CgoContext = createContext<CgoContextValue | null>(null);

function mergeSynced(db: CgoDatabase, now: Date): CgoDatabase {
  const { ops, tasks } = syncDatabaseView(db.operationInstances, db.taskInstances, now);
  return {
    ...db,
    operationInstances: ops,
    taskInstances: tasks,
  };
}

export function CgoProvider({ children }: { children: ReactNode }) {
  const [offsetMs, setOffsetMs] = useState(0);
  const [tick, setTick] = useState(0);
  const [rawDb, setRawDb] = useState<CgoDatabase>(() => {
    const loaded = loadDb();
    if (loaded) return loaded;
    return createSeedDatabase(new Date());
  });
  const [currentUserId, setCurrentUserId] = useState("u-cgo-1");

  const effectiveNow = useMemo(() => {
    void tick;
    return new Date(Date.now() + offsetMs);
  }, [offsetMs, tick]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((x) => x + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    saveDb(rawDb);
  }, [rawDb]);

  const dbView = useMemo(
    () => mergeSynced(rawDb, effectiveNow),
    [rawDb, effectiveNow]
  );

  const refresh = useCallback(() => setTick((x) => x + 1), []);

  const setClockOffsetMinutes = useCallback((m: number) => {
    setOffsetMs(m * 60_000);
  }, []);

  const advanceClockHours = useCallback((h: number) => {
    setOffsetMs((o) => o + h * 3_600_000);
  }, []);

  const resetClock = useCallback(() => setOffsetMs(0), []);

  const resetSeed = useCallback(() => {
    const db = createSeedDatabase(new Date(Date.now() + offsetMs));
    setRawDb(db);
    saveDb(db);
  }, [offsetMs]);

  const exportJson = useCallback(() => exportDbJson(rawDb), [rawDb]);

  const importJsonFile = useCallback((text: string) => {
    const db = importDbJson(text);
    setRawDb(db);
    saveDb(db);
  }, []);

  const appendLog = useCallback(
    (entry: Omit<AuditLog, "id" | "createdAt"> & { createdAt?: string }) => {
      const log: AuditLog = {
        ...entry,
        id: newId("log"),
        createdAt: entry.createdAt ?? new Date(Date.now() + offsetMs).toISOString(),
      };
      setRawDb((d) => ({ ...d, auditLogs: [log, ...d.auditLogs] }));
    },
    [offsetMs]
  );

  const registerDecision = useCallback(
    (partial: Omit<CGODecision, "id" | "createdAt"> & { createdAt?: string }) => {
      const dec: CGODecision = {
        ...partial,
        id: newId("dec"),
        createdAt: partial.createdAt ?? new Date(Date.now() + offsetMs).toISOString(),
      };
      setRawDb((d) => ({ ...d, cgoDecisions: [dec, ...d.cgoDecisions] }));
      appendLog({
        operationInstanceId: dec.operationInstanceId,
        taskInstanceId: dec.taskInstanceId,
        userId: dec.userId,
        eventType: "decisao_cgo",
        previousStatus: null,
        newStatus: null,
        description: `${dec.decisionType}: ${dec.instruction}`,
        source: "manual",
        observation: dec.justification,
        attachmentUrl: null,
      });
    },
    [appendLog, offsetMs]
  );

  const dismissRadar = useCallback(
    (operationId: string) => {
      setRawDb((d) => ({
        ...d,
        operationInstances: d.operationInstances.map((o) =>
          o.id === operationId
            ? {
                ...o,
                radarDismissed: true,
                isOnRadar: false,
                updatedAt: new Date(Date.now() + offsetMs).toISOString(),
              }
            : o
        ),
      }));
      appendLog({
        operationInstanceId: operationId,
        taskInstanceId: null,
        userId: currentUserId,
        eventType: "saida_radar_manual",
        previousStatus: null,
        newStatus: null,
        description: "CGO dispensou permanência no Radar após tratativa.",
        source: "manual",
        observation: null,
        attachmentUrl: null,
      });
    },
    [appendLog, currentUserId, offsetMs]
  );

  const upsertOperationTemplate = useCallback((tpl: OperationTemplate) => {
    setRawDb((d) => {
      const ix = d.operationTemplates.findIndex((x) => x.id === tpl.id);
      const next =
        ix >= 0
          ? d.operationTemplates.map((x) => (x.id === tpl.id ? tpl : x))
          : [...d.operationTemplates, tpl];
      return { ...d, operationTemplates: next };
    });
  }, []);

  const upsertTaskTemplate = useCallback((t: TaskTemplate) => {
    setRawDb((d) => {
      const ix = d.taskTemplates.findIndex((x) => x.id === t.id);
      const next =
        ix >= 0 ? d.taskTemplates.map((x) => (x.id === t.id ? t : x)) : [...d.taskTemplates, t];
      return { ...d, taskTemplates: next };
    });
  }, []);

  const duplicateOperationTemplate = useCallback((id: string) => {
    setRawDb((d) => {
      const src = d.operationTemplates.find((x) => x.id === id);
      if (!src) return d;
      const nid = newId("tpl");
      const copy: OperationTemplate = {
        ...src,
        id: nid,
        name: `${src.name} (cópia)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const tasks = d.taskTemplates.filter((t) => t.operationTemplateId === id);
      const newTasks = tasks.map((t) => {
        const tid = newId("tt");
        return { ...t, id: tid, operationTemplateId: nid };
      });
      return {
        ...d,
        operationTemplates: [...d.operationTemplates, copy],
        taskTemplates: [...d.taskTemplates, ...newTasks],
      };
    });
  }, []);

  const setTemplateActive = useCallback((id: string, isActive: boolean) => {
    setRawDb((d) => ({
      ...d,
      operationTemplates: d.operationTemplates.map((x) =>
        x.id === id ? { ...x, isActive, updatedAt: new Date().toISOString() } : x
      ),
    }));
  }, []);

  const value: CgoContextValue = {
    now: effectiveNow,
    setClockOffsetMinutes,
    advanceClockHours,
    resetClock,
    currentUserId,
    setCurrentUserId,
    rawDb,
    dbView,
    refresh,
    resetSeed,
    exportJson,
    importJsonFile,
    appendLog,
    registerDecision,
    dismissRadar,
    upsertOperationTemplate,
    upsertTaskTemplate,
    duplicateOperationTemplate,
    setTemplateActive,
  };

  return <CgoContext.Provider value={value}>{children}</CgoContext.Provider>;
}

export function useCgo(): CgoContextValue {
  const ctx = useContext(CgoContext);
  if (!ctx) throw new Error("useCgo fora do CgoProvider");
  return ctx;
}
