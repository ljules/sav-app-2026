/** 
 * Structure simplifiée envoyée au serveur lors d'une sauvegarde (POST ou PUT). 
 */
export interface RecetteFormDTO { 
  /** * L'ID est optionnel (?) car lors de la création d'une nouvelle recette,  
   * c'est le serveur qui va générer cet identifiant unique. 
   */ 
  id?: number | null; 
  titre: string; 
  description: string; 
  surgraissage: number; 
  avecSoude: boolean; 
  concentrationAlcali: number; 
  ligneIngredients: LigneIngredientDTO[]; 
} 
 
export interface LigneIngredientDTO { 
  ingredientId: number; 
  recetteId?: number | null; 
  quantite: number; 
  pourcentage: number; 
} 
