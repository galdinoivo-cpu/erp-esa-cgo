export type OceStatus =
  | "AGUARDANDO_RETIRADA"
  | "CHECKLIST_EM_ANDAMENTO"
  | "CHECKLIST_DIVERGENTE"
  | "OPERACAO_AUTORIZADA"
  | "EM_DESLOCAMENTO"
  | "NA_FAZENDA"
  | "EM_EXECUCAO"
  | "OPERACAO_CONCLUIDA"
  | "RETORNO_PENDENTE"
  | "RECEBIMENTO_REVERSO"
  | "FINALIZADA"
  | "BLOQUEADA";

export type ChecklistItemStatus = "pendente" | "validado" | "divergente" | "bloqueado";

export type ValidacaoMetodo = "QR_CODE" | "NFC" | "RFID" | "TRANSPONDER" | "ID_MANUAL";

export interface OceChecklistItem {
  item_id: string;
  nome: string;
  tipo: string;
  validacao: ValidacaoMetodo;
  obrigatorio: boolean;
  status: ChecklistItemStatus;
  lido_em: string | null;
  validado_por: string | null;
  observacao: string | null;
}

export interface OceRecord {
  oce_id: string;
  osf_id: string;
  operacao_id: string;
  status: OceStatus;
  data_prevista: string;
  hora_prevista: string;
  colr_origem: { id: string; nome: string };
  enxame_designado: string;
  operador_id: string;
  operador: {
    id: string;
    nome: string;
    documento: string;
    telefone: string;
  };
  fazenda: {
    nome: string;
    endereco: string;
    google_maps_url: string;
    talhao: string;
    hectares: number;
    cultura: string;
    observacoes_acesso: string;
    ponto_entrada: string | null;
  };
  contatos: {
    engenheiro: { nome: string; whatsapp: string };
    operador_calda: { nome: string; whatsapp: string };
    responsavel_fazenda: { nome: string; telefone: string } | null;
    emergencia: { nome: string; telefone: string } | null;
  };
  checklist_retirada: OceChecklistItem[];
  autorizacao: {
    data_hora: string | null;
    operador_responsavel: string | null;
    colr_origem: string | null;
  };
  historico_eventos: OceEvent[];
}

export type OceEventType =
  | "LOGIN_REALIZADO"
  | "OCE_ABERTA"
  | "OPERADOR_VALIDADO"
  | "ITEM_CHECKLIST_LIDO"
  | "CHECKLIST_CONCLUIDO"
  | "OPERACAO_AUTORIZADA"
  | "SAIDA_COLR_REGISTRADA"
  | "CHEGADA_FAZENDA_REGISTRADA"
  | "INICIO_OPERACAO"
  | "PAUSA_OPERACAO"
  | "OCORRENCIA_REGISTRADA"
  | "FIM_OPERACAO"
  | "RETORNO_COLR"
  | "CHECKLIST_REVERSO_CONCLUIDO"
  | "OCE_FINALIZADA";

export interface OceEvent {
  tipo_evento: OceEventType;
  data_hora: string;
  usuario_id: string;
  perfil_usuario: string;
  oce_id: string;
  localizacao: string | null;
  payload: Record<string, unknown>;
}

export interface ProducaoHistoricoItem {
  id: string;
  operador_id: string;
  oce_id: string;
  data_operacao: string;
  fazenda: string;
  talhao: string;
  hectares_executados: number;
  status_oce: OceStatus;
  status_laudo: "pendente" | "em_analise" | "aprovado" | "rejeitado";
  valor_a_receber: number;
  data_prevista_pagamento: string;
  status_pagamento: "a_receber" | "programado" | "pago" | "bloqueado" | "em_analise";
  observacao_pendencia: string | null;
}

export interface OceDatabase {
  oces: OceRecord[];
  producaoHistorico: ProducaoHistoricoItem[];
}
