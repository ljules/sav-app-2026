import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ingredient } from '../../models/ingredient.model';
import { LigneIngredient, Recette } from '../../models/recette.model';
import { LigneIngredientDTO, RecetteFormDTO } from '../../models/dto.model';
import { IngredientService } from '../../services/ingredient.service';
import { RecetteService } from '../../services/recette.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recipe-calculator-page',
  imports: [ FormsModule, CommonModule ],
  templateUrl: './recipe-calculator-page.html',
  styleUrl: './recipe-calculator-page.css',
})
export class RecipeCalculatorPage implements OnInit {
    public modeDosage: 'masse' | 'pourcentage' = 'masse';

    // Liste des ingrédients disponibles :
    public ingredientsDispo: Ingredient[] = [];

    // Ingrédients sélectionnés :
    public choixIngredient: Ingredient | null = null;
    public selectionIngredients: LigneIngredient[] = [];
    public masseTotale = 0;

    // Nouvelle recette :
    public nouvelleRecetteDTO: RecetteFormDTO = {
    id: null,
    titre: '',
    description: '',
    surgraissage: 0,
    avecSoude: false,
    concentrationAlcalin: 0,  // Rajouter le n à la fin
    ligneIngredients: []
    }

    // Affichage de la recette après son calcul :
    public recetteAffichee: Recette | null = null;

    // Couleurs Bootstrap pour représenter ingrédients de la recette :
    public couleurIngredient = [
        "bg-info",
        "bg-success",
        "bg-warning",
        "bg-secondary",
        "bg-primary",
        "bg-danger"
    ]


    // Injection des services par le constructeur :
    constructor(
        private ingredientService: IngredientService,
        private recetteService: RecetteService,
        public authService: AuthService,
    ) {}

    // Initialisation : Récupération de la liste des ingrédients via l'API :
    ngOnInit(): void {
        this.ingredientService.getIngredients().subscribe( data => this.ingredientsDispo = data);
    }

    public mettreAJourSurgraissage(valeur: number | null): void {
        this.nouvelleRecetteDTO.surgraissage = Math.max(0, Number(valeur) || 0);
    }

    public mettreAJourConcentration(valeur: number | null): void {
        this.nouvelleRecetteDTO.concentrationAlcalin = Math.max(0, Number(valeur) || 0);
    }

    public choisirAlcalin(avecSoude: boolean): void {
        this.nouvelleRecetteDTO.avecSoude = avecSoude;
        if (avecSoude) {
            this.nouvelleRecetteDTO.concentrationAlcalin = 90;
        }
    }


    /**
     * Ajoute une ligne ingrédient à la recette
     */
    ajouterIngredient(): void {
        // Refus des doublons :i
        if (this.choixIngredient && this.selectionIngredients.find(l => l.ingredient.id === this.choixIngredient?.id)) {
            return;
        }

        // Ajout de la ligneIngredient :
        this.selectionIngredients.push({
            ingredient: this.choixIngredient!,
            quantite: 0,
            pourcentage: 0
        })

        // Optionnel : Réinitialiser le menu déroulant après l'ajout
        this.choixIngredient = null;
    }


    get ingredientsDisponiblePourAjout(): Ingredient[] {
        return this.ingredientsDispo.filter(
            ing => !this.selectionIngredients.some(
                ligne => ligne.ingredient?.id === ing.id
            )
        );
    }


    /**
     * Recalcule les pourcentages
     */  
    recalculerPourcentages(): void {
        this.masseTotale = this.selectionIngredients.reduce((acc, ligne) => acc + ligne.quantite, 0); // Somme des masse des ingrédients de la recette
        
        this.selectionIngredients.forEach(ligne => {
            ligne.pourcentage = this.masseTotale > 0
                ? +(ligne.quantite / this.masseTotale * 100).toFixed(2)
                : 0;
        });
    }

    public changerModeDosage(mode: 'masse' | 'pourcentage'): void {
        this.modeDosage = mode;
        if (mode === 'masse') {
            this.recalculerQuantites();
            this.recalculerPourcentages();
        } else {
            this.recalculerPourcentages();
        }
    }

    public mettreAJourPourcentage(ligne: LigneIngredient, valeur: number | null): void {
        ligne.pourcentage = Math.min(100, Math.max(0, Number(valeur) || 0));
        this.recalculerQuantites();
    }

    public mettreAJourMasseTotale(valeur: number | null): void {
        this.masseTotale = Math.max(0, Number(valeur) || 0);
        this.recalculerQuantites();
    }

    private recalculerQuantites(): void {
        this.selectionIngredients.forEach((ligne) => {
            ligne.quantite = +(this.masseTotale * ligne.pourcentage / 100).toFixed(2);
        });
    }

    public get totalPourcentage(): number {
        return +this.selectionIngredients
            .reduce((total, ligne) => total + ligne.pourcentage, 0)
            .toFixed(2);
    }

    public get pourcentageValide(): boolean {
        return Math.abs(this.totalPourcentage - 100) < 0.01;
    }

    public get dosageValide(): boolean {
        return this.selectionIngredients.length > 0 && this.masseTotale > 0 &&
            (this.modeDosage === 'masse' || this.pourcentageValide);
    }


    /**
     * Supprime un ingrédient préalablement choisi pour la recette en cours
     * @param index 
     */
    supprimerIngredient(index: number): void {
        this.selectionIngredients.splice(index, 1);
        if (this.modeDosage === 'masse') {
            this.recalculerPourcentages();
        } else {
            this.recalculerQuantites();
        }
      }

    
    /**
     * Méthode de soumission du nouvel ingrédient
     */
    onSubmit(): void {
        // 1. Associer les ingrédients à  ligneIngredientDTO :
        const ligneIngredientDTOs = this.selectionIngredients.map(ligne => ({
            quantite: ligne.quantite,
            pourcentage: ligne.pourcentage,
            ingredientId: ligne.ingredient?.id ?? 0
          }));
        //console.log(`LigneIngredientDTOs = `, ligneIngredientDTOs);


        // 2. Finalisation de l'objet RecetteFormDTO :
        const recetteEnvoyee: RecetteFormDTO = {
            ...this.nouvelleRecetteDTO,
            ligneIngredients: ligneIngredientDTOs
          };
        //console.log('Objet RecetteDTO prêt à envoyer :', recetteEnvoyee);
      

        // 3. Envoi de la recette à l'API via le service recette :
        this.recetteService.createRecette(recetteEnvoyee).subscribe({
            next: (recette: Recette) => {
                this.recetteAffichee = recette; // On récupère la recette avec les scores
                alert("Recette calculée et enregistrée avec succès !");
                //console.log('Recette reçue du backend :', recette);

            },
            error: (err) => {
                alert("Erreur lors du calcul. Vérifier vos données.");
                //console.error('Erreur lors de la création de la recette :', err);                
            }
        });
    }   
}
