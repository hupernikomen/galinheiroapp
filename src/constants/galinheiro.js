export const MARGEM_DE_LUCRO = 0.60;

export const SEMANA_INICIO_POSTURA = 18;
export const VIDA_TOTAL_SEMANAS = 90;
export const SEMANAS_POSTURA = VIDA_TOTAL_SEMANAS - SEMANA_INICIO_POSTURA; // 72

export const MARCOS_PADRAO = [
  { semana: 0, mensagem: 'Início do lote' },
  { semana: 18, mensagem: 'Início da postura' },
  { semana: 70, mensagem: 'Comprar novo Lote' },
  { semana: 90, mensagem: 'Fim do ciclo' },
];

export const FASES = [
  { nome: 'Cria', inicio: 0, fim: 8 },
  { nome: 'Recria', inicio: 9, fim: 17 },
  { nome: 'Pré-postura', inicio: 18, fim: 19 },
  { nome: 'Postura', inicio: 20, fim: 90 },
];