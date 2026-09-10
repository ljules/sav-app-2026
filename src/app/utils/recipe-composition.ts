import { LigneIngredient } from '../models/recette.model';

export const couleursComposition = ['#8aa017', '#7e1fa2', '#087cff', '#ffbf00', '#e66a43', '#219e91', '#c75489', '#5268a4', '#966b35', '#648441'];

export function compositionRecette(lignes: LigneIngredient[], eau: number | null = null,
  alcalin: number | null = null, avecSoude = true) {
  const masses = lignes.map(l => ({ name: l.ingredient.nom, quantite: l.quantite }));
  if (eau !== null) masses.push({ name: 'Eau', quantite: eau });
  if (alcalin !== null) masses.push({ name: avecSoude ? 'Soude (NaOH)' : 'Potasse (KOH)', quantite: alcalin });
  const total = masses.reduce((sum, l) => sum + Math.max(0, l.quantite), 0);
  return masses.map((item, i) => {
    const value = total > 0 ? Math.max(0, item.quantite) / total * 100 : 0;
    const percent = value.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
    return { ...item, value, percent, color: couleursComposition[i % couleursComposition.length],
      label: `${item.name} : ${item.quantite} g (${percent} %)` };
  });
}
