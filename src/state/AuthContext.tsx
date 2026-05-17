import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthDatabase, AuthSession, ErpUser, UserProfile, UserStatus } from "@/types/auth";
import type { OceDatabase, OceEvent, OceEventType, OceRecord } from "@/types/oce";
import { getMasterPassword, MASTER_LOGIN_USERNAME } from "@/config/authConfig";
import { homePathForProfile } from "@/domain/authRoutes";
import {
  allMandatoryItemsValidated,
  deriveOceStatusFromChecklist,
  hasCriticalBlock,
} from "@/domain/oceRules";
import { createSeedAuthDb, hashPasswordMock, verifyPasswordMock } from "@/data/authSeed";
import {
  clearSession,
  loadSession,
  loadUsers,
  migrateClearPersistedSession,
  saveSession,
  saveUsers,
} from "@/data/authPersistence";
import { createSeedOceDb } from "@/data/oceSeed";
import { loadOceDb, saveOceDb } from "@/data/ocePersistence";

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

type AuthContextValue = {
  authDb: AuthDatabase;
  oceDb: OceDatabase;
  session: AuthSession | null;
  currentUser: ErpUser | null;
  login: (login: string, password: string) => { ok: boolean; error?: string; redirect?: string };
  logout: () => void;
  upsertUser: (user: ErpUser, plainPassword?: string) => void;
  resetUserPassword: (userId: string, plainPassword: string) => void;
  setUserStatus: (userId: string, status: UserStatus) => void;
  getOcesForOperador: (operadorId: string) => OceRecord[];
  getOcesForColr: (colrId: string) => OceRecord[];
  getOceById: (oceId: string) => OceRecord | undefined;
  setActiveOceId: (id: string | null) => void;
  activeOceId: string | null;
  validateChecklistItem: (
    oceId: string,
    itemId: string,
    readId: string,
    validatorUserId: string,
    validatorPerfil: string
  ) => { ok: boolean; error?: string };
  appendOceEvent: (
    oceId: string,
    tipo: OceEventType,
    usuarioId: string,
    perfil: string,
    payload?: Record<string, unknown>
  ) => void;
  updateOce: (oce: OceRecord) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  migrateClearPersistedSession();

  const [users, setUsers] = useState<ErpUser[]>(() => {
    const seed = createSeedAuthDb().users;
    const loaded = loadUsers();
    if (!loaded?.length) return seed;
    const merged = [...loaded];
    for (const su of seed) {
      if (!merged.some((u) => u.id === su.id)) merged.push(su);
    }
    return merged.map((u) => {
      const base = seed.find((s) => s.id === u.id);
      return {
        ...u,
        contratoId: u.contratoId ?? base?.contratoId ?? null,
        clienteId: u.clienteId ?? base?.clienteId ?? null,
        fazendaIds: u.fazendaIds ?? base?.fazendaIds ?? null,
        crea: u.crea ?? base?.crea ?? null,
      };
    });
  });
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const [oceDb, setOceDb] = useState<OceDatabase>(() => loadOceDb() ?? createSeedOceDb());
  const [activeOceId, setActiveOceId] = useState<string | null>(null);

  const authDb: AuthDatabase = useMemo(() => ({ users, session }), [users, session]);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    if (session) saveSession(session);
    else clearSession();
  }, [session]);

  useEffect(() => saveOceDb(oceDb), [oceDb]);

  const currentUser = useMemo(
    () => (session ? users.find((u) => u.id === session.userId) ?? null : null),
    [users, session]
  );

  const appendOceEvent = useCallback(
    (
      oceId: string,
      tipo: OceEventType,
      usuarioId: string,
      perfil: string,
      payload: Record<string, unknown> = {}
    ) => {
      const ev: OceEvent = {
        tipo_evento: tipo,
        data_hora: new Date().toISOString(),
        usuario_id: usuarioId,
        perfil_usuario: perfil,
        oce_id: oceId,
        localizacao: null,
        payload,
      };
      setOceDb((d) => ({
        ...d,
        oces: d.oces.map((o) =>
          o.oce_id === oceId ? { ...o, historico_eventos: [ev, ...o.historico_eventos] } : o
        ),
      }));
    },
    []
  );

  const updateOce = useCallback((oce: OceRecord) => {
    setOceDb((d) => ({
      ...d,
      oces: d.oces.map((o) => (o.oce_id === oce.oce_id ? oce : o)),
    }));
  }, []);

  const login = useCallback(
    (loginName: string, password: string) => {
      const trimmed = loginName.trim().toLowerCase();
      const masterPw = getMasterPassword();

      if (trimmed === MASTER_LOGIN_USERNAME.toLowerCase() && masterPw && password === masterPw) {
        const diretor =
          users.find((u) => u.perfil === "DIRETOR_CGO_MASTER" && u.status === "ativo") ?? users[0];
        if (!diretor) return { ok: false, error: "Usuário diretor não configurado." };
        const sess: AuthSession = {
          userId: diretor.id,
          perfil: diretor.perfil,
          loginAt: new Date().toISOString(),
          viaMasterKey: true,
        };
        setSession(sess);
        return { ok: true, redirect: homePathForProfile(diretor.perfil) };
      }

      const user = users.find((u) => u.login.toLowerCase() === trimmed);
      if (!user) return { ok: false, error: "Usuário ou senha inválidos." };
      if (user.status === "bloqueado") return { ok: false, error: "Usuário bloqueado. Contacte a CGO." };
      if (user.status === "pendente") return { ok: false, error: "Cadastro pendente de ativação." };
      if (!verifyPasswordMock(password, user.passwordHash)) {
        return { ok: false, error: "Usuário ou senha inválidos." };
      }

      const sess: AuthSession = {
        userId: user.id,
        perfil: user.perfil,
        loginAt: new Date().toISOString(),
        viaMasterKey: false,
      };
      setSession(sess);
      return { ok: true, redirect: homePathForProfile(user.perfil) };
    },
    [users]
  );

  const logout = useCallback(() => {
    setSession(null);
    clearSession();
    setActiveOceId(null);
  }, []);

  const upsertUser = useCallback((user: ErpUser, plainPassword?: string) => {
    setUsers((list) => {
      const ix = list.findIndex((u) => u.id === user.id);
      const nextUser = {
        ...user,
        passwordHash: plainPassword ? hashPasswordMock(plainPassword) : user.passwordHash,
        updatedAt: new Date().toISOString(),
      };
      return ix >= 0 ? list.map((u) => (u.id === user.id ? nextUser : u)) : [...list, nextUser];
    });
  }, []);

  const resetUserPassword = useCallback((userId: string, plainPassword: string) => {
    setUsers((list) =>
      list.map((u) =>
        u.id === userId
          ? { ...u, passwordHash: hashPasswordMock(plainPassword), updatedAt: new Date().toISOString() }
          : u
      )
    );
  }, []);

  const setUserStatus = useCallback((userId: string, status: UserStatus) => {
    setUsers((list) =>
      list.map((u) =>
        u.id === userId ? { ...u, status, updatedAt: new Date().toISOString() } : u
      )
    );
  }, []);

  const getOceById = useCallback(
    (oceId: string) => oceDb.oces.find((o) => o.oce_id === oceId),
    [oceDb.oces]
  );

  const getOcesForOperador = useCallback(
    (operadorId: string) => oceDb.oces.filter((o) => o.operador_id === operadorId),
    [oceDb.oces]
  );

  const getOcesForColr = useCallback(
    (colrId: string) => oceDb.oces.filter((o) => o.colr_origem.id === colrId),
    [oceDb.oces]
  );

  const validateChecklistItem = useCallback(
    (
      oceId: string,
      itemId: string,
      readId: string,
      validatorUserId: string,
      validatorPerfil: string
    ) => {
      const oce = oceDb.oces.find((o) => o.oce_id === oceId);
      if (!oce) return { ok: false, error: "OCE não encontrada." };

      const item = oce.checklist_retirada.find((i) => i.item_id === itemId);
      if (!item) return { ok: false, error: "Item não encontrado no checklist." };

      const normalizedRead = readId.trim().toUpperCase();
      const normalizedItem = itemId.trim().toUpperCase();
      if (normalizedRead !== normalizedItem) {
        const updatedItems = oce.checklist_retirada.map((i) =>
          i.item_id === itemId
            ? {
                ...i,
                status: "divergente" as const,
                observacao: `ID lido (${readId}) não confere com ${itemId}`,
              }
            : i
        );
        let next: OceRecord = {
          ...oce,
          checklist_retirada: updatedItems,
          status: "CHECKLIST_DIVERGENTE",
        };
        updateOce(next);
        appendOceEvent(oceId, "ITEM_CHECKLIST_LIDO", validatorUserId, validatorPerfil, {
          item_id: itemId,
          divergente: true,
        });
        return { ok: false, error: "ID não confere com o item esperado." };
      }

      const now = new Date().toISOString();
      const updatedItems = oce.checklist_retirada.map((i) =>
        i.item_id === itemId
          ? {
              ...i,
              status: "validado" as const,
              lido_em: now,
              validado_por: validatorUserId,
              observacao: null,
            }
          : i
      );

      let next: OceRecord = { ...oce, checklist_retirada: updatedItems };
      next.status = deriveOceStatusFromChecklist(next);

      if (allMandatoryItemsValidated(updatedItems) && !hasCriticalBlock(updatedItems)) {
        next.status = "OPERACAO_AUTORIZADA";
        next.autorizacao = {
          data_hora: now,
          operador_responsavel: oce.operador.nome,
          colr_origem: oce.colr_origem.nome,
        };
        appendOceEvent(oceId, "CHECKLIST_CONCLUIDO", validatorUserId, validatorPerfil, {});
        appendOceEvent(oceId, "OPERACAO_AUTORIZADA", validatorUserId, validatorPerfil, {
          operador: oce.operador.nome,
        });
      }

      updateOce(next);
      appendOceEvent(oceId, "ITEM_CHECKLIST_LIDO", validatorUserId, validatorPerfil, {
        item_id: itemId,
      });
      return { ok: true };
    },
    [oceDb.oces, updateOce, appendOceEvent]
  );

  const value: AuthContextValue = {
    authDb,
    oceDb,
    session,
    currentUser,
    login,
    logout,
    upsertUser,
    resetUserPassword,
    setUserStatus,
    getOcesForOperador,
    getOcesForColr,
    getOceById,
    setActiveOceId,
    activeOceId,
    validateChecklistItem,
    appendOceEvent,
    updateOce,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}
