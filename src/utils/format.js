export function formatarData(valor) {
  if (!valor) return '-';
  const d = new Date(Number(valor));
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('pt-BR');
}

export function formatarValor(v, casas = 2) {
  return Number(v || 0).toFixed(casas);
}
