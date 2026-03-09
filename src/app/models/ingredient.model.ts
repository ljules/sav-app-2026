/** 
 * Représente un ingrédient (principalement des corps gras) de la base de données. 
 */
export interface Ingredient { 
  id: number; 
  nom: string; 
  iode: number; 
  ins: number; 
  sapo: number; // Indice de saponification (NaOH) 
   
  // Propriétés calculées par l'algorithme : 
  volMousse: number; 
  tenueMousse: number; 
  douceur: number; 
  lavant: number; 
  durete: number; 
  solubilite: number; 
  sechage: number; 
   
  estCorpsGras: boolean; 
} 