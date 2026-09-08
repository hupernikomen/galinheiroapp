export const VIDA_TOTAL_SEMANAS = 90;
export const TAMANHO = 220;
export const CHAVE_PADRAO = '@usarMarcosPadrao';
export const INTERVALO_SLIDER_MS = 5000;
export const DURACAO_MARCO_MS = 1500;

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

export function semanaParaAngulo(semana) {
  const s = Math.min(Math.max(Number(semana) || 0, 0), VIDA_TOTAL_SEMANAS);
  return (s / VIDA_TOTAL_SEMANAS) * 360;
}