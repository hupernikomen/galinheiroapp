export function formatarData(valor) {
  if (!valor) return '-';
  const d = new Date(Number(valor));
  if (Number.isNaN(d.getTime())) return '-';

  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = String(d.getFullYear()).slice(-2);

  return `${dia}/${mes}/${ano}`;
}

export function formatarValor(v, casas = 2) {
  return Number(v || 0).toFixed(casas);
}
