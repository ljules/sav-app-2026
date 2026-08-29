import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ingredient } from '../../models/ingredient.model';
import { IngredientService } from '../../services/ingredient.service';
import { RecetteService } from '../../services/recette.service';
import { Recette } from '../../models/recette.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, CommonModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {

    // Déclaration du tableau de stockage des ingrédients & recettes :
    public ingredients: Ingredient[] = [];
    public recettes: Recette[] = [];


    // Date du jour :
    public dateJour = new Date();

    // Recette du jour :
    public titreRecetteDuJour: string | null = null;
    public descriptionRecetteDuJour: string | null = null;

    // Dernière recette saisie :
    public derniereRecetteSaisie: Recette | null = null;


    // Injection du service :
        constructor(
            private ingredientService: IngredientService,
            private recetteService: RecetteService) {}
    

    // Méthode d'initialisation du composant :
    ngOnInit(): void {
        this.getIngredients();
        this.getRecettes();             
    }

    // Récupération des ingrédients :
    getIngredients(): void {
        this.ingredientService.getIngredients().subscribe({
            next: (data) =>{
                this.ingredients = data;
                //console.log("Ingrédients récupérés avec succès !")                               
            },
            error: (err) =>{
                console.error("Erreur API : ", err);
            } 
        });
    }

    // Récupération recettes :
    getRecettes(): void {
        this.recetteService.getRecettes().subscribe({
            next: (data) => {
                this.recettes = data;
                this.getRecetteJour(); 
                this.getDerniereRecette();
            },
            error : (err) => {
                console.error("Erreur API : ", err);
            }
        })
    }

    // Tirer la recette du jour :
    private getRecetteJour(): void {
        //console.log("Recettes ; ", this.recettes);
        const iRecetteDuJour = Math.floor(Date.now() / 86400000) % this.recettes.length;
        //console.log("Indice recette de jour : ", iRecetteDuJour);
        this.titreRecetteDuJour = this.recettes[iRecetteDuJour].titre;
        this.descriptionRecetteDuJour = this.recettes[iRecetteDuJour].description;
    }


    private getDerniereRecette(): void {
        if (this.recettes.length === 0) {
            this.derniereRecetteSaisie = null;
            return;
        }
        let derniere = this.recettes[0];

        for (const recette of this.recettes) {
            if (new Date(recette.dateCreation) > new Date(derniere.dateCreation)) {
                derniere = recette;
            }
        }
        this.derniereRecetteSaisie = derniere;
    }

}
