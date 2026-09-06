/**
 * Raças pré-definidas para teste.
 * producaoEstimada = ovos por galinha na vida produtiva (aprox.)
 */
export const RACAS = [
  { id: 'bkb', nome: 'BKB / Caipira melhorada', producaoEstimada: 250 },
  { id: 'embrapa_051', nome: 'Embrapa 051', producaoEstimada: 345 },
  { id: 'isa_brown', nome: 'Isa Brown', producaoEstimada: 300 },
  { id: 'novogen_white', nome: 'Novogen White', producaoEstimada: 330 },
  { id: 'novogen_brown', nome: 'Novogen Brown', producaoEstimada: 320 },
  { id: 'pescoco_pelado', nome: 'Pescoço Pelado', producaoEstimada: 200 },
  { id: 'rhode_island', nome: 'Rhode Island Red', producaoEstimada: 260 },
  { id: 'outra', nome: 'Outra (informar produção)', producaoEstimada: 0 },
];

export function buscarRacaPorId(id) {
  return RACAS.find((r) => r.id === id) || null;
}