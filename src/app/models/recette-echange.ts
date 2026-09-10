import { Recette } from './recette.model';
import { RecetteFormDTO } from './dto.model';

export interface RecetteEchange {
  id?: number | null;
  utilisateurId?: number | null;
  titre: string;
  description: string;
  surgraissage: number;
  avecSoude: boolean;
  concentrationAlcalin: number;
  ligneIngredients: { ingredientId: number; quantite: number }[];
}
export interface FichierRecettes {
  format: 'sav-app-recettes';
  version: '1.0.0';
  exporteLe?: string;
  recettes: RecetteEchange[];
}
const objet = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const cles = (v: Record<string, unknown>, keys: string[]) => Object.keys(v).every(k => keys.includes(k));
export const identifiantValide = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v > 0;
const nombre = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

// L'enveloppe est validée avant toute écriture ; les recettes sont validées séparément.
export function lireFichierRecettes(texte: string): unknown[] {
  let v: unknown;
  try { v = JSON.parse(texte.replace(/^\uFEFF/, '')); }
  catch { throw new Error('Le fichier JSON est illisible.'); }
  if (!objet(v) || !cles(v, ['format', 'version', 'exporteLe', 'recettes']) ||
      v['format'] !== 'sav-app-recettes' || v['version'] !== '1.0.0' || !Array.isArray(v['recettes'])) {
    throw new Error('Format ou version non pris en charge : sav-app-recettes 1.0.0 attendu.');
  }
  if (v['exporteLe'] !== undefined && (typeof v['exporteLe'] !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(v['exporteLe']) ||
      !Number.isFinite(Date.parse(v['exporteLe'])))) throw new Error('Date exporteLe invalide.');
  return v['recettes'];
}
export function validerRecette(v: unknown): asserts v is RecetteEchange {
  if (!objet(v) || !cles(v, ['id','utilisateurId','titre','description','surgraissage','avecSoude','concentrationAlcalin','ligneIngredients']) ||
      (v['id'] != null && !identifiantValide(v['id'])) ||
      (v['utilisateurId'] != null && !identifiantValide(v['utilisateurId'])) ||
      typeof v['titre'] !== 'string' || !v['titre'].trim() || typeof v['description'] !== 'string' ||
      typeof v['avecSoude'] !== 'boolean' || !nombre(v['surgraissage']) || v['surgraissage'] < 0 || v['surgraissage'] > 100 ||
      !nombre(v['concentrationAlcalin']) || v['concentrationAlcalin'] <= 0 || v['concentrationAlcalin'] > 100 ||
      !Array.isArray(v['ligneIngredients']) || !v['ligneIngredients'].length) throw new Error('Données de recette invalides.');
  let total = 0;
  for (const l of v['ligneIngredients']) {
    if (!objet(l) || !cles(l, ['ingredientId','quantite']) || !identifiantValide(l['ingredientId']) ||
        !nombre(l['quantite']) || l['quantite'] <= 0) throw new Error('Identifiant ou quantité d’ingrédient invalide.');
    total += l['quantite'];
  }
  if (!Number.isFinite(total)) throw new Error('Quantité totale invalide.');
}
export function exporterRecette(r: Recette, utilisateurId: number): RecetteEchange {
  return { id: r.id, utilisateurId, titre: r.titre, description: r.description,
    surgraissage: r.surgraissage, avecSoude: r.avecSoude, concentrationAlcalin: r.concentrationAlcalin,
    ligneIngredients: r.ligneIngredients.map(l => ({ ingredientId: l.ingredient.id, quantite: l.quantite })) };
}
export function formulation(r: RecetteEchange) {
  return { titre: r.titre, description: r.description, surgraissage: r.surgraissage,
    avecSoude: r.avecSoude, concentrationAlcalin: r.concentrationAlcalin,
    ligneIngredients: r.ligneIngredients.map(l => ({ ingredientId: l.ingredientId, quantite: l.quantite })) };
}
export function recettesIdentiques(a: RecetteEchange, b: RecetteEchange): boolean {
  return JSON.stringify(formulation(a)) === JSON.stringify(formulation(b));
}
export function versDTO(r: RecetteEchange): RecetteFormDTO {
  const total = r.ligneIngredients.reduce((s,l) => s + l.quantite, 0);
  return { ...formulation(r), ligneIngredients: r.ligneIngredients.map(l => ({ ...l,
    pourcentage: +(l.quantite / total * 100).toFixed(2) })) };
}
