export const VIDA_TOTAL_SEMANAS = 90;
export const DIAS_TOTAL = VIDA_TOTAL_SEMANAS * 7; // 630 dias
export const TAMANHO = 220;
export const CHAVE_PADRAO = '@usarMarcosPadrao';
export const INTERVALO_SLIDER_MS = 3500;
export const DURACAO_PONTEIRO_MS = 1200;

/**
 * Marcos padrão do sistema.
 * - dia: quando aparece no ciclo (só naquele dia)
 * - semana: referência / confirmação
 *
 * 1º dia da semana N = (N - 1) * 7 + 1
 */


// Exemplo: vacinas no 1º dia de cada semana (descomente e troque MARCOS_PADRAO se quiser)
export const MARCOS_PADRAO = [
  { dia: 1,   semana: 1,  titulo: 'Vacina', mensagem: 'Marek (HVT + Rispens)' },
  { dia: 8,   semana: 2,  titulo: 'Vacina', mensagem: 'Newcastle (B1 ou La Sota) e Bronquite Infecciosa (H120)' },
  { dia: 15,  semana: 3,  titulo: 'Vacina', mensagem: 'Gumboro (cepa intermediária)' },
  { dia: 22,  semana: 4,  titulo: 'Vacina', mensagem: 'Gumboro (reforço)' },
  { dia: 29,  semana: 5,  titulo: 'Vacina', mensagem: 'Newcastle (reforço La Sota) e Bronquite Infecciosa (reforço)' },
  { dia: 50,  semana: 8,  titulo: 'Vacina', mensagem: 'Newcastle (3º reforço)' },
  { dia: 78,  semana: 12, titulo: 'Vacina', mensagem: 'Bronquite Infecciosa (3º reforço)' },
  { dia: 92,  semana: 14, titulo: 'Vacina', mensagem: 'Newcastle + Bronquite (oleosa)' },
  { dia: 490, semana: 70, titulo: 'Alerta', mensagem: 'Comprar novo lote' },
  { dia: 630, semana: 90, titulo: '', mensagem: 'Fim do ciclo' },
];


/** Ângulo (0–360) a partir do dia de vida (1…DIAS_TOTAL) */
export function diaParaAngulo(dia) {
  const d = Math.min(Math.max(Number(dia) || 0, 0), DIAS_TOTAL);
  return (d / DIAS_TOTAL) * 360;
}

/** Semana de vida a partir dos dias (dia 1–7 = sem. 1) */
export function diasParaSemana(dias) {
  const d = Math.max(Number(dias) || 0, 0);
  if (d <= 0) return 1;
  return Math.min(VIDA_TOTAL_SEMANAS, Math.ceil(d / 7));
}

/** Posição do marco na borda pelo início da semana (compatibilidade) */
export function semanaParaAngulo(semana) {
  const s = Math.min(Math.max(Number(semana) || 0, 0), VIDA_TOTAL_SEMANAS);
  const dia = s <= 0 ? 0 : (s - 1) * 7 + 1;
  return diaParaAngulo(dia);
}

/** 1º dia da semana N */
export function primeiroDiaDaSemana(semana) {
  const s = Number(semana) || 0;
  if (s <= 0) return 1;
  return (s - 1) * 7 + 1;
}