import { Component, OnInit } from '@angular/core';
import { Recette } from '../../models/recette.model';
import { RecetteService } from '../../services/recette.service';
import { CommonModule } from '@angular/common';
import { Chart, registerables} from 'chart.js/auto'
Chart.register(...registerables);

@Component({
  selector: 'app-recipe-manager-page',
  imports: [CommonModule],
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

            // On attend un court instant que le DOM se mette à jour avec le @for 
            setTimeout(() => { 
                this.recettes.forEach(r => this.initChart(r)); 
            }, 100); 
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

    /** 
     * Crée le graphique Radar pour une recette spécifique 
     */ 
    initChart(recette: Recette): void { 
        const ctx = document.getElementById(`chart-${recette.id}`) as HTMLCanvasElement; 
        if (!ctx) return; 
    
        new Chart(ctx, { 
            type: 'radar', 
            data: { 
                labels: recette.resultats.map(res => res.caracteristique.nom), 
                datasets: [{ 
                    label: 'Scores', 
                    data: recette.resultats.map(res => res.score), 
                    fill: true, 
                    backgroundColor: 'rgba(210, 0, 255, 0.2)',
                    borderColor: 'rgb(210, 0, 255)',
                    pointBackgroundColor: 'rgb(0, 180, 0)',
                    pointBorderColor: 'rgb(0, 180, 0)',
                    pointHoverBackgroundColor: 'rgb(255, 255, 255)',
                    pointHoverBorderColor: 'rgb(0, 180, 0)'
                }] 
            }, 
            options: { 
                elements: { line: { borderWidth: 2 } }, 
                scales: {  
                    r: { suggestedMin: 0,suggestedMax: 10, ticks: { stepSize: 1 }
            }
                }, 
                plugins: { legend: { display: false } } 
                } 
            });
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
