import { RecipeComposition } from '../../components/recipe-composition/recipe-composition';
import { RecipeExchange } from '../../components/recipe-exchange/recipe-exchange';
import { Component, OnInit } from '@angular/core';
import { Recette } from '../../models/recette.model';
import { RecetteService } from '../../services/recette.service';
import { CommonModule } from '@angular/common';
import { RecipeProfileChart } from '../../components/recipe-profile-chart/recipe-profile-chart';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recipe-manager-page',
  imports: [CommonModule, RecipeProfileChart, RouterLink, RecipeExchange, RecipeComposition],
  templateUrl: './recipe-manager-page.html',
  styleUrl: './recipe-manager-page.css',
})

export class RecipeManagerPage implements OnInit {
    public recettes: Recette[] = []

    // Propriété pour stocker la recette à afficher dans la modale
    public recetteSelectionnee: Recette | null = null;

    // Propriétés pour les statistiques globales :
    public ingredientLePlusUtilise: string | null = null;
    public nbRecettesUtilisantIngredientLePlusUtilise: number = 0

    public nbRecettesPotasse = 0;

    constructor(private recetteService: RecetteService) {}

    ngOnInit(): void {
        this.chargerRecettes();
    }

    /** 
     * Charge les recettes et initialise les graphiques 
     */
    chargerRecettes(): void { 
        this.recetteService.getRecettes().subscribe(data => { 
            this.recettes = data; 
            this.calculerIngredientLePlusUtilise();
            this.nbRecettesPotasse = this.recettes.filter(
                recette => recette.avecSoude === false
            ).length;

        }); 
    }

    supprimerRecette(id: number): void {
        if (confirm("Supprimer cette recette ?")) {
            this.recetteService.deletteRecette(id).subscribe( () =>
            this.chargerRecettes());
        }
    }
    
    /** 
     * Définit la recette sélectionnée pour l'affichage des détails 
     */ 
    ouvrirModale(recette: Recette): void { 
        this.recetteSelectionnee = recette; 
    } 
    
    /** 
     * Réinitialise la sélection à la fermeture 
     */ 
    fermerModale(): void { 
        this.recetteSelectionnee = null; 
    } 

    private calculerIngredientLePlusUtilise(): void {
        // Dictionnaire ingredient.nom : nombre_occurence
        const compteur = new Map<string, number>();
        // Boucle de valorisation du du dictionnaire compteur :
        for (const recette of this.recettes) {
            for (const ligne of recette.ligneIngredients) {
                const nomIngredient = ligne.ingredient.nom;
                compteur.set(nomIngredient, (compteur.get(nomIngredient) ?? 0) + 1);
            }
        }      

        let ingredientMax: string | null = null;
        let maxUtilisations = 0;

        // Boucle de de recherche de la recette la plus utilisée et de son nombre d'occurrences :
        compteur.forEach((nbUtilisations, nomIngredient) => {
            if (nbUtilisations > maxUtilisations) {
                maxUtilisations = nbUtilisations;
                ingredientMax = nomIngredient;
            }            
        });
        this.ingredientLePlusUtilise = ingredientMax;
        this.nbRecettesUtilisantIngredientLePlusUtilise = maxUtilisations;
    }



}
