export type ModeloPulverizacao = "EMERGENCIAL" | "NORMAL" | "PONTUAL";

export type OsfStatus =
  | "OSF_RASCUNHO"
  | "OSF_ENVIADA"
  | "EM_ANALISE_ESA"
  | "AGUARDANDO_VALIDACAO_FINANCEIRA"
  | "AGUARDANDO_AGENDA"
  | "PROGRAMADA"
  | "RECUSADA"
  | "CANCELADA"
  | "CONVERTIDA_EM_OPERACAO";

export type LaudoStatus =
  | "AGUARDANDO_GERACAO"
  | "DISPONIVEL_PARA_ASSINATURA"
  | "ASSINADO"
  | "APROVADO_COM_OBSERVACAO"
  | "DEVOLVIDO_PARA_CORRECAO"
  | "FINALIZADO";

export type EtapaStatus = "pendente" | "em_andamento" | "concluida" | "atencao" | "bloqueada";

export interface PortalEngenheiroVinculo {
  contratoId: string;
  clienteId: string;
  fazendaIds: string[];
  crea: string;
}

export interface OsfRecord {
  osf_id: string;
  contrato_id: string;
  cliente_id: string;
  fazenda_id: string;
  engenheiro: {
    usuario_id: string;
    nome: string;
    documento: string;
    crea: string;
    whatsapp: string;
  };
  fazenda: {
    nome: string;
    endereco: string;
    google_maps_url: string;
    ponto_entrada: string;
  };
  operador_calda: {
    nome: string;
    whatsapp: string;
  };
  dados_operacionais: {
    cultura: string;
    talhoes: string[];
    area_hectares: number;
    modelo_pulverizacao: ModeloPulverizacao;
    data_solicitada: string;
    janela_operacional: string;
    observacoes_tecnicas: string;
    observacoes_acesso: string;
    confirmacao_responsabilidade: boolean;
    anexo_mapa_nome: string | null;
  };
  status: OsfStatus;
  criado_em: string;
  atualizado_em: string;
  data_programada: string | null;
  previsao_inicio: string | null;
  previsao_termino: string | null;
  percentual_preparacao: number;
  historico_eventos: PortalEvent[];
}

export interface PreparacaoEtapa {
  id: string;
  ordem: number;
  titulo: string;
  status: EtapaStatus;
}

export interface LaudoRecord {
  laudo_id: string;
  osf_id: string;
  operacao_id: string;
  contrato_id: string;
  fazenda_id: string;
  fazenda: string;
  talhoes: string[];
  area_prevista_ha: number;
  area_executada_ha: number;
  data_operacao: string;
  status_laudo: LaudoStatus;
  assinatura_engenheiro: {
    usuario_id: string;
    nome: string;
    documento: string;
    crea: string;
    assinado_em: string | null;
    observacao: string;
    ip_dispositivo: string | null;
  } | null;
}

export type PortalEventType =
  | "LOGIN_ENGENHEIRO"
  | "OSF_RASCUNHO_CRIADO"
  | "OSF_ENVIADA"
  | "OSF_EDITADA"
  | "OSF_CANCELADA_PELO_CLIENTE"
  | "MAPA_PREPARACAO_VISUALIZADO"
  | "LAUDO_VISUALIZADO"
  | "LAUDO_ASSINADO_PELO_ENGENHEIRO"
  | "LAUDO_APROVADO_COM_OBSERVACAO"
  | "LAUDO_DEVOLVIDO_PARA_CORRECAO";

export interface PortalEvent {
  tipo_evento: PortalEventType;
  usuario_id: string;
  perfil_usuario: string;
  contrato_id: string;
  fazenda_id: string;
  osf_id: string | null;
  data_hora: string;
  payload: Record<string, unknown>;
}

export interface PortalClienteDatabase {
  contratos: { id: string; nome: string; cliente_id: string }[];
  fazendas: {
    id: string;
    cliente_id: string;
    contrato_id: string;
    nome: string;
    endereco: string;
    google_maps_url: string;
    ponto_entrada: string;
    talhoes_disponiveis: string[];
  }[];
  datas_disponiveis: string[];
  osfs: OsfRecord[];
  laudos: LaudoRecord[];
  preparacao_por_osf: Record<string, PreparacaoEtapa[]>;
}
