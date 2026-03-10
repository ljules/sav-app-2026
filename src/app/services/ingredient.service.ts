import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ingredient } from '../models/ingredient.model';

@Injectable({
    providedIn: 'root' // Le service est disponible dans toute l'application
})
export class IngredientService {

    // URL de base de notre API : 
    private readonly API_URL_INGREDIENT = 'http://localhost:8080/api-savon/v1/ingredient';

    constructor(private http: HttpClient) { }

    /** 
    * Récupère la liste de tous les ingrédients depuis le backend. 
    * @returns Un Observable contenant le tableau des ingrédients. 
    */
    getIngredients(): Observable<Ingredient[]> {
        return this.http.get<Ingredient[]>(this.API_URL_INGREDIENT);
    }

    /** 
     * Récupère un ingrédient spécifique par son identifiant. 
     * @param id L'identifiant de l'ingrédient 
     */
    getIngredientById(id: number): Observable<Ingredient> {
        return this.http.get<Ingredient>(`${this.API_URL_INGREDIENT}/${id}`);
    }
    
    /** * Ajoute un nouvel ingrédient.  
     */ 
    addIngredient(ingredient: Ingredient): Observable<Ingredient> { 
        return this.http.post<Ingredient>(this.API_URL_INGREDIENT, ingredient); 
    }

    /** * Met à jour un ingrédient existant.  
    */
    updateIngredient(ingredient: Ingredient): Observable<Ingredient> {
        return this.http.put<Ingredient>
            (`${this.API_URL_INGREDIENT}/${ingredient.id}`, ingredient);
    } 

    /** * Supprime un ingrédient par son ID.  
     */ 
    deleteIngredient(id: number): Observable<void> { 
        return this.http.delete<void>(`${this.API_URL_INGREDIENT}/${id}`); 
    } 
 
    /** * Supprime tous les ingrédients de la base.  
     */ 
    deleteAllIngredients(): Observable<void> { 
        return this.http.delete<void>(`${this.API_URL_INGREDIENT}/all`); 
    } 
}
