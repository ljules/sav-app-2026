import { Ingredient } from "./ingredient.model";

/** 
 * Détail d'un ingrédient spécifique au sein d'une recette. 
 */
export interface LigneIngredient { 
  quantite: number; 
  pourcentage: number; 
  ingredient: Ingredient; 
} 
 
/** 
 * Score et appréciation pour une propriété du savon (Douceur, Lavant, etc.) 
 */
export interface Resultat { 
  score: number; 
  caracteristique: { id: number; nom: string }; 
  mention?: { label: string; noteMin: number; noteMax: number }; 
} 
 
/** 
 * Modèle complet d'une recette récupérée depuis le Backend (Lecture seule). 
 */
export interface Recette { 
  id: number; 
  titre: string; 
  description: string; 
  surgraissage: number; 
  apportEnEau: number; 
  avecSoude: boolean; 
  concentrationAlcali: number; 
  qteAlcali: number; 
  ligneIngredients: LigneIngredient[]; 
  resultats: Resultat[]; 
} 
