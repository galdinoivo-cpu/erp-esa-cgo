import type { PortalClienteDatabase, PreparacaoEtapa } from "@/types/clientePortal";

export const MOCK_DATAS_DISPONIVEIS = ["2026-05-20", "2026-05-21", "2026-05-23", "2026-05-24"];

export const DEFAULT_ETAPAS: Omit<PreparacaoEtapa, "status">[] = [
  { id: "e1", ordem: 1, titulo: "OSF enviada" },
  { id: "e2", ordem: 2, titulo: "Contrato validado" },
  { id: "e3", ordem: 3, titulo: "Agenda em análise" },
  { id: "e4", ordem: 4, titulo: "Operação programada" },
  { id: "e5", ordem: 5, titulo: "COLR definido" },
  { id: "e6", ordem: 6, titulo: "Enxame reservado" },
  { id: "e7", ordem: 7, titulo: "Ativos em preparação" },
  { id: "e8", ordem: 8, titulo: "Checklist de retirada" },
  { id: "e9", ordem: 9, titulo: "Operação autorizada" },
  { id: "e10", ordem: 10, titulo: "Em deslocamento" },
  { id: "e11", ordem: 11, titulo: "Na fazenda" },
  { id: "e12", ordem: 12, titulo: "Em execução" },
  { id: "e13", ordem: 13, titulo: "Operação concluída" },
  { id: "e14", ordem: 14, titulo: "Laudo disponível" },
];

function etapasFromPercent(pct: number): PreparacaoEtapa[] {
  const n = DEFAULT_ETAPAS.length;
  const done = Math.floor((pct / 100) * n);
  return DEFAULT_ETAPAS.map((e, i) => {
    let status: PreparacaoEtapa["status"] = "pendente";
    if (i < done) status = "concluida";
    else if (i === done) status = "em_andamento";
    return { ...e, status };
  });
}

export function createSeedPortalDb(): PortalClienteDatabase {
  const osfDemo = "OSF-2026-000098";
  return {
    contratos: [{ id: "CTR-XXXy", nome: "Contrato Fazenda Santa Clara", cliente_id: "CLI-0001" }],
    fazendas: [
      {
        id: "FAZ-0001",
        cliente_id: "CLI-0001",
        contrato_id: "CTR-XXXy",
        nome: "Fazenda Santa Clara",
        endereco: "BR-242, Km 45, Luís Eduardo Magães — BA",
        google_maps_url:
          "https://www.google.com/maps/search/?api=1&query=Fazenda+Santa+Clara+BA",
        ponto_entrada: "Portão norte",
        talhoes_disponiveis: ["01", "02", "03", "04", "05", "06"],
      },
    ],
    datas_disponiveis: MOCK_DATAS_DISPONIVEIS,
    osfs: [
      {
        osf_id: osfDemo,
        contrato_id: "CTR-XXXy",
        cliente_id: "CLI-0001",
        fazenda_id: "FAZ-0001",
        engenheiro: {
          usuario_id: "ENG-0001",
          nome: "Eng. Rafael Técnico",
          documento: "12345678900",
          crea: "CREA-BA 123456",
          whatsapp: "+5511977770100",
        },
        fazenda: {
          nome: "Fazenda Santa Clara",
          endereco: "BR-242, Km 45, Luís Eduardo Magães — BA",
          google_maps_url:
            "https://www.google.com/maps/search/?api=1&query=Fazenda+Santa+Clara+BA",
          ponto_entrada: "Portão norte",
        },
        operador_calda: { nome: "Marcos Calda", whatsapp: "+5511966660200" },
        dados_operacionais: {
          cultura: "Soja",
          talhoes: ["01", "02"],
          area_hectares: 280,
          modelo_pulverizacao: "NORMAL",
          data_solicitada: "2026-05-21",
          janela_operacional: "Manhã",
          observacoes_tecnicas: "Área com reboleira leve no talhão 02",
          observacoes_acesso: "Avisar na portaria",
          confirmacao_responsabilidade: true,
          anexo_mapa_nome: null,
        },
        status: "PROGRAMADA",
        criado_em: "2026-05-10T10:00:00.000Z",
        atualizado_em: "2026-05-15T14:00:00.000Z",
        data_programada: "2026-05-22",
        previsao_inicio: "2026-05-22T06:00:00",
        previsao_termino: "2026-05-22T18:00:00",
        percentual_preparacao: 72,
        historico_eventos: [],
      },
    ],
    laudos: [
      {
        laudo_id: "LAU-2026-000001",
        osf_id: "OSF-2025-000890",
        operacao_id: "OP-2025-000890",
        contrato_id: "CTR-XXXy",
        fazenda_id: "FAZ-0001",
        fazenda: "Fazenda Santa Clara",
        talhoes: ["03", "04"],
        area_prevista_ha: 200,
        area_executada_ha: 198.4,
        data_operacao: "2026-04-10",
        status_laudo: "DISPONIVEL_PARA_ASSINATURA",
        assinatura_engenheiro: null,
      },
    ],
    preparacao_por_osf: {
      [osfDemo]: etapasFromPercent(72),
    },
  };
}
