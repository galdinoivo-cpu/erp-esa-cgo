import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ErpUser } from "@/types/auth";
import type {
  LaudoRecord,
  LaudoStatus,
  OsfRecord,
  OsfStatus,
  PortalClienteDatabase,
  PortalEvent,
  PortalEventType,
} from "@/types/clientePortal";
import { createSeedPortalDb, DEFAULT_ETAPAS, MOCK_DATAS_DISPONIVEIS } from "@/data/portalSeed";
import { loadPortalDb, savePortalDb } from "@/data/portalPersistence";

function newOsfId(seq: number): string {
  return `OSF-2026-${String(seq).padStart(6, "0")}`;
}

function newLaudoId(seq: number): string {
  return `LAU-2026-${String(seq).padStart(6, "0")}`;
}

type PortalContextValue = {
  portalDb: PortalClienteDatabase;
  getFazendaForUser: (user: ErpUser) => PortalClienteDatabase["fazendas"][0] | undefined;
  getOsfsForUser: (user: ErpUser) => OsfRecord[];
  getLaudosForUser: (user: ErpUser) => LaudoRecord[];
  getPreparacao: (osfId: string) => PortalClienteDatabase["preparacao_por_osf"][string];
  saveOsfRascunho: (partial: Omit<OsfRecord, "osf_id" | "criado_em" | "atualizado_em" | "historico_eventos"> & { osf_id?: string }) => OsfRecord;
  submitOsf: (osfId: string) => void;
  appendPortalEvent: (ev: Omit<PortalEvent, "data_hora"> & { data_hora?: string }) => void;
  signLaudo: (laudoId: string, user: ErpUser, observacao: string, action: "assinar" | "aprovar_obs" | "correcao") => void;
  getLaudo: (id: string) => LaudoRecord | undefined;
};

const PortalContext = createContext<PortalContextValue | null>(null);

export function PortalClienteProvider({ children }: { children: ReactNode }) {
  const [portalDb, setPortalDb] = useState<PortalClienteDatabase>(() => loadPortalDb() ?? createSeedPortalDb());

  useEffect(() => savePortalDb(portalDb), [portalDb]);

  const appendPortalEvent = useCallback(
    (ev: Omit<PortalEvent, "data_hora"> & { data_hora?: string }) => {
      const full: PortalEvent = { ...ev, data_hora: ev.data_hora ?? new Date().toISOString() };
      setPortalDb((d) => ({
        ...d,
        osfs: d.osfs.map((o) =>
          o.osf_id === ev.osf_id ? { ...o, historico_eventos: [full, ...o.historico_eventos] } : o
        ),
      }));
    },
    []
  );

  const getFazendaForUser = useCallback(
    (user: ErpUser) => {
      const fid = user.fazendaIds?.[0];
      return portalDb.fazendas.find((f) => f.id === fid || f.contrato_id === user.contratoId);
    },
    [portalDb.fazendas]
  );

  const getOsfsForUser = useCallback(
    (user: ErpUser) =>
      portalDb.osfs.filter(
        (o) =>
          o.contrato_id === user.contratoId &&
          o.engenheiro.usuario_id === user.id
      ),
    [portalDb.osfs]
  );

  const getLaudosForUser = useCallback(
    (user: ErpUser) =>
      portalDb.laudos.filter((l) => l.contrato_id === user.contratoId),
    [portalDb.laudos]
  );

  const getPreparacao = useCallback(
    (osfId: string) => {
      const existing = portalDb.preparacao_por_osf[osfId];
      if (existing) return existing;
      return DEFAULT_ETAPAS.map((e) => ({ ...e, status: "pendente" as const }));
    },
    [portalDb.preparacao_por_osf]
  );

  const saveOsfRascunho = useCallback(
    (
      partial: Omit<OsfRecord, "osf_id" | "criado_em" | "atualizado_em" | "historico_eventos"> & {
        osf_id?: string;
      }
    ) => {
      const now = new Date().toISOString();
      let saved!: OsfRecord;
      setPortalDb((d) => {
        const seq = d.osfs.length + 1;
        const id = partial.osf_id ?? newOsfId(seq);
        const ix = d.osfs.findIndex((o) => o.osf_id === id);
        const base: OsfRecord = {
          ...partial,
          osf_id: id,
          status: (partial.status as OsfStatus) ?? "OSF_RASCUNHO",
          criado_em: ix >= 0 ? d.osfs[ix].criado_em : now,
          atualizado_em: now,
          historico_eventos: ix >= 0 ? d.osfs[ix].historico_eventos : [],
          percentual_preparacao: partial.percentual_preparacao ?? 5,
          data_programada: partial.data_programada ?? null,
          previsao_inicio: partial.previsao_inicio ?? null,
          previsao_termino: partial.previsao_termino ?? null,
        };
        saved = base;
        const osfs =
          ix >= 0 ? d.osfs.map((o) => (o.osf_id === id ? base : o)) : [...d.osfs, base];
        return {
          ...d,
          osfs,
          preparacao_por_osf: {
            ...d.preparacao_por_osf,
            [id]:
              d.preparacao_por_osf[id] ??
              DEFAULT_ETAPAS.map((e) => ({ ...e, status: "pendente" as const })),
          },
        };
      });
      return saved;
    },
    []
  );

  const submitOsf = useCallback((osfId: string) => {
    const now = new Date().toISOString();
    setPortalDb((d) => ({
      ...d,
      osfs: d.osfs.map((o) =>
        o.osf_id === osfId
          ? {
              ...o,
              status: "OSF_ENVIADA" as OsfStatus,
              atualizado_em: now,
              percentual_preparacao: Math.max(o.percentual_preparacao, 12),
            }
          : o
      ),
      preparacao_por_osf: {
        ...d.preparacao_por_osf,
        [osfId]:
          d.preparacao_por_osf[osfId]?.map((e, i) =>
            i === 0 ? { ...e, status: "concluida" } : e
          ) ?? DEFAULT_ETAPAS.map((e, i) => ({ ...e, status: i === 0 ? "concluida" : "pendente" })),
      },
    }));
  }, []);

  const getLaudo = useCallback(
    (id: string) => portalDb.laudos.find((l) => l.laudo_id === id),
    [portalDb.laudos]
  );

  const signLaudo = useCallback(
    (laudoId: string, user: ErpUser, observacao: string, action: "assinar" | "aprovar_obs" | "correcao") => {
      const now = new Date().toISOString();
      let eventType: PortalEventType = "LAUDO_ASSINADO_PELO_ENGENHEIRO";
      let status: LaudoStatus = "ASSINADO";
      if (action === "aprovar_obs") {
        eventType = "LAUDO_APROVADO_COM_OBSERVACAO";
        status = "APROVADO_COM_OBSERVACAO";
      }
      if (action === "correcao") {
        eventType = "LAUDO_DEVOLVIDO_PARA_CORRECAO";
        status = "DEVOLVIDO_PARA_CORRECAO";
      }

      setPortalDb((d) => ({
        ...d,
        laudos: d.laudos.map((l) =>
          l.laudo_id === laudoId
            ? {
                ...l,
                status_laudo: status,
                assinatura_engenheiro:
                  action === "correcao"
                    ? l.assinatura_engenheiro
                    : {
                        usuario_id: user.id,
                        nome: user.nomeCompleto,
                        documento: user.documento,
                        crea: user.crea ?? "",
                        assinado_em: now,
                        observacao,
                        ip_dispositivo: "protótipo-web",
                      },
              }
            : l
        ),
      }));
    },
    []
  );

  const value: PortalContextValue = {
    portalDb,
    getFazendaForUser,
    getOsfsForUser,
    getLaudosForUser,
    getPreparacao,
    saveOsfRascunho,
    submitOsf,
    appendPortalEvent,
    signLaudo,
    getLaudo,
  };

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortalCliente(): PortalContextValue {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortalCliente fora do PortalClienteProvider");
  return ctx;
}

export { MOCK_DATAS_DISPONIVEIS };
