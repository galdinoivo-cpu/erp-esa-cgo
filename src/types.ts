export type TimeUnit = "minutes" | "hours" | "days";

export interface Duration {
  value: number;
  unit: TimeUnit;
}

export type TrafficStatus = "verde" | "amarelo" | "vermelho";

export type OperationStatus =
  | "rascunho"
  | "programada"
  | "em_andamento"
  | "verde"
  | "amarelo"
  | "vermelho"
  | "concluido"
  | "cancelado"
  | "arquivado";

export type TaskStatus =
  | "pendente"
  | "em_andamento"
  | "verde"
  | "amarelo"
  | "vermelho"
  | "concluido"
  | "bloqueado";

export type Priority = "baixa" | "normal" | "alta" | "critica";

export type LogSource = "automatico" | "manual";

export type Region = "Bahia" | "Mato Grosso do Sul" | "Santa Catarina" | "Outro";

export type COL = "COL Bahia" | "COL MS" | "COL SC" | "N/A";

export interface OperationTemplate {
  id: string;
  name: string;
  group: string;
  type: string;
  description: string;
  defaultOwnerRole: string;
  defaultSector: string;
  defaultLocation: string;
  triggerType: string;
  normalTimeLimit: Duration;
  yellowTimeLimit: Duration;
  redTimeLimit: Duration;
  /** Janela antes do marco principal para entrar no Radar */
  radarLeadBeforeStart: Duration;
  requiresChecklist: boolean;
  requiresPhysicalReading: boolean;
  requiresDocument: boolean;
  requiresCGOApproval: boolean;
  requiresReport: boolean;
  blocksNextStep: boolean;
  escalatesToCGO: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskTemplate {
  id: string;
  operationTemplateId: string;
  name: string;
  sequence: number;
  ownerRole: string;
  sector: string;
  normalTimeLimit: Duration;
  yellowTimeLimit: Duration;
  redTimeLimit: Duration;
  dependsOnPreviousTask: boolean;
  checklistTemplateId: string | null;
  requiredDocumentType: string | null;
  requiredAssetType: string | null;
  closingRule: string;
  initialStatus: TaskStatus;
  isActive: boolean;
}

export interface OperationInstance {
  id: string;
  operationTemplateId: string;
  title: string;
  group: string;
  type: string;
  status: OperationStatus;
  traffic: TrafficStatus;
  scheduledStart: string;
  scheduledEnd: string;
  /** Marco usado para calcular entrada no radar (ex.: retirada COL) */
  radarAnchorAt: string;
  radarEntryAt: string;
  radarExitAt: string | null;
  currentOwner: string;
  sector: string;
  location: string;
  clientName: string;
  farmName: string;
  fieldName: string;
  region: Region;
  col: COL;
  provider: string;
  priority: Priority;
  isOnRadar: boolean;
  /** Vermelho permanece no radar até decisão ou encerramento */
  criticalRadarHold: boolean;
  radarDismissed: boolean;
  currentIssue: string;
  cancelled: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  createdByUserId: string;
}

export interface TaskInstance {
  id: string;
  operationInstanceId: string;
  taskTemplateId: string;
  name: string;
  sequence: number;
  status: TaskStatus;
  traffic: TrafficStatus;
  scheduledStart: string;
  scheduledEnd: string;
  radarEntryAt: string;
  owner: string;
  sector: string;
  startedAt: string | null;
  completedAt: string | null;
  yellowAt: string;
  redAt: string;
  isBlocked: boolean;
  checklistDivergence: "nenhuma" | "corrigivel" | "critica";
  documentPending: boolean;
  documentBlocks: boolean;
  currentIssue: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  operationInstanceId: string;
  taskInstanceId: string | null;
  userId: string;
  eventType: string;
  previousStatus: string | null;
  newStatus: string | null;
  description: string;
  source: LogSource;
  observation: string | null;
  attachmentUrl: string | null;
  createdAt: string;
}

export interface CGODecision {
  id: string;
  operationInstanceId: string;
  taskInstanceId: string | null;
  decisionType: string;
  instruction: string;
  assignedTo: string;
  deadline: string;
  justification: string;
  impact: string;
  userId: string;
  createdAt: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  requiresPhysicalReading: boolean;
  isActive: boolean;
}

export interface ChecklistItem {
  id: string;
  checklistTemplateId: string;
  description: string;
  required: boolean;
  requiresAssetReading: boolean;
}

export interface ChecklistExecution {
  id: string;
  taskInstanceId: string;
  checklistTemplateId: string;
  status: "pendente" | "ok" | "divergente";
  executedBy: string | null;
  executedAt: string | null;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  physicalId: string;
  status: string;
  location: string;
  parentAssetId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  operationInstanceId: string;
  taskInstanceId: string | null;
  type: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface CgoUser {
  id: string;
  name: string;
  role: string;
}

export interface CgoDatabase {
  users: CgoUser[];
  operationTemplates: OperationTemplate[];
  taskTemplates: TaskTemplate[];
  checklistTemplates: ChecklistTemplate[];
  checklistItems: ChecklistItem[];
  operationInstances: OperationInstance[];
  taskInstances: TaskInstance[];
  auditLogs: AuditLog[];
  cgoDecisions: CGODecision[];
  checklistExecutions: ChecklistExecution[];
  assets: Asset[];
  documents: Document[];
}
