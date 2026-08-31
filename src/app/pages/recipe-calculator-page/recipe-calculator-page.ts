import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ingredient } from '../../models/ingredient.model';
import { LigneIngredient, Recette } from '../../models/recette.model';
import { LigneIngredientDTO, RecetteFormDTO } from '../../models/dto.model';
import { IngredientService } from '../../services/ingredient.service';
import { RecetteService } from '../../services/recette.service';
import { AuthService } from '../../services/auth.service';
import { CalculRecetteService, ScoresRecette } from '../../services/calcul-recette.service';

@Component({
  selector: 'app-recipe-calculator-page',
  imports: [ FormsModule, CommonModule ],
  templateUrl: './recipe-calculator-page.html',
  styleUrl: './recipe-calculator-page.css',
})
export class RecipeCalculatorPage implements OnInit {
    @ViewChild('ouvertureModalEnvoi')
    private boutonOuvertureModalEnvoi?: ElementRef<HTMLButtonElement>;

    public modeDosage: 'masse' | 'pourcentage' = 'masse';
    public resultatEnvoi: 'succes' | 'erreur' | null = null;

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
    surgraissage: 5,
    avecSoude: true,
    concentrationAlcalin: 90,
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
        private calculRecetteService: CalculRecetteService,
        public authService: AuthService,
    ) {}

    // Initialisation : Récupération de la liste des ingrédients via l'API :
    ngOnInit(): void {
        this.ingredientService.getIngredients().subscribe( data => this.ingredientsDispo = data);
        this.recalculerRecette();
    }

    public mettreAJourSurgraissage(valeur: number | null): void {
        this.nouvelleRecetteDTO.surgraissage = Math.max(0, Number(valeur) || 0);
        this.recalculerRecette();
    }

    public mettreAJourConcentration(valeur: number | null): void {
        this.nouvelleRecetteDTO.concentrationAlcalin = Math.min(100, Math.max(0, Number(valeur) || 0));
        this.recalculerRecette();
    }

    public choisirAlcalin(avecSoude: boolean): void {
        this.nouvelleRecetteDTO.avecSoude = avecSoude;
        if (avecSoude) {
            this.nouvelleRecetteDTO.concentrationAlcalin = 90;
        }
        this.recalculerRecette();
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
        this.recalculerRecette();
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
        this.masseTotale = this.calculRecetteService.recalculerPourcentages(this.selectionIngredients);
        this.recalculerRecette();
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
        this.recalculerRecette();
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
        this.recalculerRecette();
      }

    private recalculerRecette(): void {
        const calcul = this.calculRecetteService.calculer(this.selectionIngredients, {
            surgraissage: this.nouvelleRecetteDTO.surgraissage,
            avecSoude: this.nouvelleRecetteDTO.avecSoude,
            concentrationAlcalin: this.nouvelleRecetteDTO.concentrationAlcalin,
        });

        this.recetteAffichee = {
            id: this.nouvelleRecetteDTO.id ?? 0,
            titre: this.nouvelleRecetteDTO.titre,
            description: this.nouvelleRecetteDTO.description,
            surgraissage: this.nouvelleRecetteDTO.surgraissage,
            avecSoude: this.nouvelleRecetteDTO.avecSoude,
            concentrationAlcalin: this.nouvelleRecetteDTO.concentrationAlcalin,
            ligneIngredients: this.selectionIngredients,
            qteAlcalin: calcul.qteAlcalin,
            apportEnEau: calcul.apportEnEau,
            resultats: this.creerResultats(calcul),
            dateCreation: new Date(),
        };
    }

    private creerResultats(calcul: ScoresRecette): Recette['resultats'] {
        return [
            { score: calcul.iode, caracteristique: { id: 1, nom: 'Iode' } },
            { score: calcul.ins, caracteristique: { id: 2, nom: 'Indice INS' } },
            { score: calcul.douceur, caracteristique: { id: 3, nom: 'Douceur' } },
            { score: calcul.lavant, caracteristique: { id: 4, nom: 'Lavant' } },
            { score: calcul.volumeMousse, caracteristique: { id: 5, nom: 'Volume de mousse' } },
            { score: calcul.tenueMousse, caracteristique: { id: 6, nom: 'Tenue de mousse' } },
            { score: calcul.durete, caracteristique: { id: 7, nom: 'Dureté' } },
            { score: calcul.solubilite, caracteristique: { id: 8, nom: 'Solubilité' } },
            { score: calcul.sechage, caracteristique: { id: 9, nom: 'Séchage' } },
        ];
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
                this.selectionIngredients = recette.ligneIngredients;
                this.nouvelleRecetteDTO = {
                    id: recette.id,
                    titre: recette.titre,
                    description: recette.description,
                    surgraissage: recette.surgraissage,
                    avecSoude: recette.avecSoude,
                    concentrationAlcalin: recette.concentrationAlcalin,
                    ligneIngredients: recette.ligneIngredients.map((ligne) => ({
                        ingredientId: ligne.ingredient.id,
                        quantite: ligne.quantite,
                        pourcentage: ligne.pourcentage,
                    })),
                };
                this.masseTotale = recette.ligneIngredients.reduce(
                    (total, ligne) => total + (Number(ligne.quantite) || 0), 0);
                this.ouvrirModalEnvoi('succes');
                //console.log('Recette reçue du backend :', recette);

            },
            error: (err) => {
                this.ouvrirModalEnvoi('erreur');
                //console.error('Erreur lors de la création de la recette :', err);                
            }
        });
    }

    public fermerModalEnvoi(): void {
        this.resultatEnvoi = null;
    }

    private ouvrirModalEnvoi(resultat: 'succes' | 'erreur'): void {
        this.resultatEnvoi = resultat;
        this.boutonOuvertureModalEnvoi?.nativeElement.click();
    }
}
