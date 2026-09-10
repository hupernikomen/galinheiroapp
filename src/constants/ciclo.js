export const VIDA_TOTAL_SEMANAS = 90;
export const DIAS_TOTAL = VIDA_TOTAL_SEMANAS * 7; // 630 dias
export const TAMANHO = 210;
export const CHAVE_PADRAO = '@usarMarcosPadrao';
export const INTERVALO_SLIDER_MS = 3500;
export const DURACAO_PONTEIRO_MS = 1200;

export const MARCOS_PADRAO = [
  { semana: 1, titulo: 'Vacina', mensagem: 'Marek (HVT + Rispens)' },
  { semana: 2, titulo: 'Vacina', mensagem: 'Newcastle (B1 ou La Sota) e Bronquite Infecciosa (H120)' },
  { semana: 3, titulo: 'Vacina', mensagem: 'Gumboro (cepa intermediária)' },
  { semana: 4, titulo: 'Vacina', mensagem: 'Gumboro (reforço)' },
  { semana: 5, titulo: 'Vacina', mensagem: 'Newcastle (reforço La Sota) e Bronquite Infecciosa (reforço)' },
  { semana: 8, titulo: 'Vacina', mensagem: 'Newcastle (3º reforço)' },
  { semana: 12, titulo: 'Vacina', mensagem: 'Bronquite Infecciosa (3º reforço)' },
  { semana: 14, titulo: 'Vacina', mensagem: 'Newcastle + Bronquite (oleosa)' },
  { semana: 70, titulo: 'Alerta', mensagem: 'Comprar novo Lote' },
  { semana: 90, titulo: '', mensagem: 'Fim do ciclo' },
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

/** Posição do marco na borda = início daquela semana em dias */
export function semanaParaAngulo(semana) {
  const s = Math.min(Math.max(Number(semana) || 0, 0), VIDA_TOTAL_SEMANAS);
  const dia = s <= 0 ? 0 : (s - 1) * 7 + 1;
  return diaParaAngulo(dia);
}