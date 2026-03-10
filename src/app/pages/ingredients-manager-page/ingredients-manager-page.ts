import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Ingredient } from '../../models/ingredient.model';
import { IngredientService } from '../../services/ingredient.service';
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-ingredients-manager-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './ingredients-manager-page.html',
  styleUrl: './ingredients-manager-page.css',
})

export class IngredientsManagerPage implements OnInit {
    // Déclaration du tableau de stockage des ingrédients
    public ingredients: Ingredient[] = [];

    // Objet temporaire/brouillon pour ajout/modification :
    public ingredientSelectionne: Ingredient | null = null;

    // Injection du service :
    constructor(private ingredientService: IngredientService) {}

    // Méthode d'initialisation du composant :
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

    /**
     * Prépare l'ajout d'un nouvel ingredient (ligne vide)
     */
    creerNouvelIngredient(): void {
        this.ingredientSelectionne = {
            id: 0, nom: '',
            sapo: 0,
            ins: 0,
            iode: 0,  
            volMousse: 0,
            tenueMousse: 0,
            douceur: 0,  
            lavant: 0,
            durete: 0,
            solubilite: 0,
            sechage: 0,  
            estCorpsGras: true
        };
    }

    /**
     * Lance l'édition d'une ligne existante
     */
    editerIngredient(item: Ingredient): void {
        // Création de la copie de travail (brouillon) pour appliquer les modifcations seulement après validation
        this.ingredientSelectionne = {...item };
    }

    /**
     * Enregistrer (Ajout si id = 0 ou update si id != 0)
     */
    saveIngredient(): void {
        if (!this.ingredientSelectionne) return; // Ne rien faire si pas d'ingrédient sélectionné
        const action = this.ingredientSelectionne.id === 0
            // Cas où id = 0 -> On ajoute le nouvel ingredient
            ? this.ingredientService.addIngredient(this.ingredientSelectionne)
            // Cas où id != 0 -> On met à jour l'ingredient existant
            : this.ingredientService.updateIngredient(this.ingredientSelectionne);

        // Rafraichissement de la présentation avec le nouvel état (ajout ou mise à jour):
        action.subscribe({
            next: () => {
                // On remet à null la sélection courante d'un ingrédient :
                this.ingredientSelectionne = null;
                // On récupère de nouveau la liste d'ingrédients pour la rafraîchir :
                this.getIngredients();
            }
        });
    }

    /**
     * Supprime un ingredient à partir de son id
     */
    deleteIngredient(id: number): void {
        if (confirm("Supprimer cet ingrédient ?")) {
            this.ingredientService.deleteIngredient(id).subscribe(
                () => this.getIngredients()
                );
        }
    }

}
