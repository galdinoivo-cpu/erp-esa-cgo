export type UserProfile =
  | "DIRETOR_CGO_MASTER"
  | "CGO_ADMIN"
  | "COLR_GERENCIA"
  | "COLR_TR"
  | "COLR_MANUTENCAO"
  | "TERCEIRIZADO_OPERADOR";

export type UserStatus = "ativo" | "bloqueado" | "pendente";

export interface ErpUser {
  id: string;
  nomeCompleto: string;
  documento: string;
  login: string;
  /** Protótipo: hash mock; migrar para backend */
  passwordHash: string;
  email: string;
  telefone: string;
  perfil: UserProfile;
  colrId: string | null;
  empresaTerceirizada: string | null;
  isTerceirizado: boolean;
  status: UserStatus;
  observacoes: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string | null;
}

export interface AuthSession {
  userId: string;
  perfil: UserProfile;
  loginAt: string;
  /** Login via chave mestre (auditoria) */
  viaMasterKey: boolean;
}

export interface AuthDatabase {
  users: ErpUser[];
  session: AuthSession | null;
}
