import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Ingredient } from '../../models/ingredient.model';
import { IngredientService } from '../../services/ingredient.service';

@Component({
  selector: 'app-ingredients-manager-page',
  imports: [CommonModule],
  templateUrl: './ingredients-manager-page.html',
  styleUrl: './ingredients-manager-page.css',
})
export class IngredientsManagerPage implements OnInit {
    // 1. Déclaration du tableau de stockage des ingrédients
    public ingredients: Ingredient[] = [];

    // 2. Injection du service :
    constructor(private ingredientService: IngredientService) {}

    // 3. Méthode d'initialisation du composant :
    ngOnInit(): void {
        this.getIngredients();
    }

    /***
     * Méthode d'appel du service pour récupérer les données par l'API
     */
    getIngredients(): void {
        this.ingredientService.getIngredients().subscribe({
            next: (data) =>{
                this.ingredients = data;
                console.log("Ingrédients récupérés avec succès !")
            },
            error: (err) =>{
                console.error("Erreur API : ", err);
            } 
        });
    }

    // TODO : Créer les méthodes :
    //      - saveIngredient(ingredient: Ingredient) -> Ajout ou met à jour l'ingrédient passé en argument
    //      - deleteIngredient(id: number) -> Surppime l'ingrédient de clé primaire id
    //      - deleteAllIngredients() - > Supprimer tous les ingrédients
}
