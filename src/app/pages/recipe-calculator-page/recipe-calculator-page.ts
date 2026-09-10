import { echelleScore, positionScore, largeurZone } from '../../utils/recipe-scores';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ingredient } from '../../models/ingredient.model';
import { LigneIngredient, Recette } from '../../models/recette.model';
import { LigneIngredientDTO, RecetteFormDTO } from '../../models/dto.model';
import { IngredientService } from '../../services/ingredient.service';
import { RecetteService } from '../../services/recette.service';
import { AuthService } from '../../services/auth.service';
import { CalculRecetteService, ScoresRecette } from '../../services/calcul-recette.service';
import { Chart } from 'chart.js/auto';
import { RecipeProfileChart } from '../../components/recipe-profile-chart/recipe-profile-chart';
import { ActivatedRoute } from '@angular/router';

type CleCaracteristique = 'sapo' | 'ins' | 'iode' | 'lavant' | 'douceur' |
    'durete' | 'solubilite' | 'sechage' | 'volMousse' | 'tenueMousse';

@Component({
  selector: 'app-recipe-calculator-page',
  imports: [ FormsModule, CommonModule, RecipeProfileChart ],
  templateUrl: './recipe-calculator-page.html',
  styleUrl: './recipe-calculator-page.css',
})
export class RecipeCalculatorPage implements OnInit, OnDestroy {
    @ViewChild('ouvertureModalEnvoi')
    private boutonOuvertureModalEnvoi?: ElementRef<HTMLButtonElement>;
    private graphiqueComposition: Chart | null = null;
    private canvasComposition: HTMLCanvasElement | null = null;

    @ViewChild('compositionChart')
    set compositionChart(element: ElementRef<HTMLCanvasElement> | undefined) {
        if (!element) {
            this.detruireGraphiqueComposition();
            this.canvasComposition = null;
            return;
        }
        this.canvasComposition = element.nativeElement;
        this.mettreAJourGraphiqueComposition();
    }

    public modeDosage: 'masse' | 'pourcentage' = 'masse';
    public resultatEnvoi: 'succes' | 'erreur' | null = null;
    public chargementRecetteEnCours = false;
    public erreurChargementRecette = false;

    // Liste des ingrédients disponibles :
    public ingredientsDispo: Ingredient[] = [];

    // Ingrédients sélectionnés :
    public choixIngredient: Ingredient | null = null;
    public selectionIngredients: LigneIngredient[] = [];
    public masseTotale = 0;
    public afficherCorpsGras = true;
    public afficherAdjuvants = true;
    public caracteristiqueFiltre: CleCaracteristique = 'sapo';
    public valeurMin: number | null = null;
    public valeurMax: number | null = null;
    public filtreNumeriqueActif = false;
    public readonly caracteristiquesFiltrables: Array<{
        cle: CleCaracteristique;
        libelle: string;
    }> = [
        { cle: 'sapo', libelle: 'Indice de saponification (SAP)' },
        { cle: 'ins', libelle: 'Indice INS' },
        { cle: 'iode', libelle: "Indice d'iode" },
        { cle: 'lavant', libelle: 'Pouvoir lavant' },
        { cle: 'douceur', libelle: 'Douceur' },
        { cle: 'durete', libelle: 'Dureté' },
        { cle: 'solubilite', libelle: 'Solubilité' },
        { cle: 'sechage', libelle: 'Séchage' },
        { cle: 'volMousse', libelle: 'Volume de mousse' },
        { cle: 'tenueMousse', libelle: 'Tenue de mousse' },
    ];

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

    private readonly couleursComposition = [
        '#8aa017', '#7e1fa2', '#0d6efd', '#ffc107', '#0dcaf0',
        '#dc3545', '#6c757d', '#198754', '#fd7e14', '#6f42c1',
    ];

    // Injection des services par le constructeur :
    constructor(
        private ingredientService: IngredientService,
        private recetteService: RecetteService,
        private calculRecetteService: CalculRecetteService,
        public authService: AuthService,
        private route: ActivatedRoute,
    ) {}

    echelleScore = echelleScore;
    positionScore = positionScore;
    largeurZone = largeurZone;

    // Initialisation : Récupération de la liste des ingrédients via l'API :
    ngOnInit(): void {
        this.ingredientService.getIngredients().subscribe( data => this.ingredientsDispo = data);
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam !== null) {
            const id = Number(idParam);
            if (Number.isInteger(id) && id > 0) {
                this.chargerRecette(id);
                return;
            }
            this.erreurChargementRecette = true;
        }
        this.recalculerRecette();
    }

    public get modeEdition(): boolean {
        return this.nouvelleRecetteDTO.id !== null &&
            this.nouvelleRecetteDTO.id !== undefined;
    }

    private chargerRecette(id: number): void {
        this.chargementRecetteEnCours = true;
        this.erreurChargementRecette = false;
        this.recetteService.getRecetteById(id).subscribe({
            next: (recette) => {
                this.appliquerRecette(recette);
                this.chargementRecetteEnCours = false;
            },
            error: () => {
                this.chargementRecetteEnCours = false;
                this.erreurChargementRecette = true;
                this.recetteAffichee = null;
            },
        });
    }

    private appliquerRecette(recette: Recette): void {
        this.recetteAffichee = recette;
        this.selectionIngredients = recette.ligneIngredients.map((ligne) => ({
            ...ligne,
            ingredient: { ...ligne.ingredient },
        }));
        this.nouvelleRecetteDTO = {
            id: recette.id,
            titre: recette.titre,
            description: recette.description,
            surgraissage: recette.surgraissage,
            avecSoude: recette.avecSoude,
            concentrationAlcalin: recette.concentrationAlcalin,
            ligneIngredients: recette.ligneIngredients.map((ligne) => ({
                ingredientId: ligne.ingredient.id,
                recetteId: recette.id,
                quantite: ligne.quantite,
                pourcentage: ligne.pourcentage,
            })),
        };
        this.masseTotale = this.selectionIngredients.reduce(
            (total, ligne) => total + (Number(ligne.quantite) || 0), 0);
        this.mettreAJourGraphiqueComposition();
    }

    ngOnDestroy(): void {
        this.detruireGraphiqueComposition();
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
        return this.ingredientsDispo.filter((ingredient) => {
            const dejaSelectionne = this.selectionIngredients.some(
                (ligne) => ligne.ingredient?.id === ingredient.id,
            );
            const correspondAuType =
                (ingredient.estCorpsGras && this.afficherCorpsGras) ||
                (!ingredient.estCorpsGras && this.afficherAdjuvants);

            if (dejaSelectionne || !correspondAuType) return false;
            if (!this.filtreNumeriqueActif) return true;
            if (!ingredient.estCorpsGras || this.plageNumeriqueInvalide) return false;

            const valeur = ingredient[this.caracteristiqueFiltre];
            const respecteMinimum = this.valeurMin === null || valeur >= this.valeurMin;
            const respecteMaximum = this.valeurMax === null || valeur <= this.valeurMax;
            return respecteMinimum && respecteMaximum;
        });
    }

    public get plageNumeriqueInvalide(): boolean {
        return this.valeurMin !== null && this.valeurMax !== null &&
            this.valeurMin > this.valeurMax;
    }

    public mettreAJourFiltres(): void {
        if (this.choixIngredient &&
            !this.ingredientsDisponiblePourAjout.some(({ id }) => id === this.choixIngredient?.id)) {
            this.choixIngredient = null;
        }
    }

    public basculerFiltreNumerique(): void {
        if (!this.filtreNumeriqueActif && this.plageNumeriqueInvalide) return;
        this.filtreNumeriqueActif = !this.filtreNumeriqueActif;
        this.mettreAJourFiltres();
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
        this.mettreAJourGraphiqueComposition();
    }

    private mettreAJourGraphiqueComposition(): void {
        if (!this.canvasComposition || !this.recetteAffichee) return;

        const lignes = this.recetteAffichee.ligneIngredients;
        const labels = lignes.map((ligne) => ligne.ingredient.nom);
        const valeurs = lignes.map((ligne) => Number(ligne.pourcentage) || 0);
        const couleurs = lignes.map((_, index) =>
            this.couleursComposition[index % this.couleursComposition.length]);

        if (this.graphiqueComposition) {
            this.graphiqueComposition.data.labels = labels;
            this.graphiqueComposition.data.datasets[0].data = valeurs;
            this.graphiqueComposition.data.datasets[0].backgroundColor = couleurs;
            this.graphiqueComposition.update();
            return;
        }

        this.graphiqueComposition = new Chart(this.canvasComposition, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: valeurs,
                    backgroundColor: couleurs,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12, usePointStyle: true },
                    },
                    tooltip: {
                        callbacks: {
                            label: (contexte) =>
                                `${contexte.label}: ${Number(contexte.raw).toFixed(2)} %`,
                        },
                    },
                },
            },
        });
    }

    private detruireGraphiqueComposition(): void {
        this.graphiqueComposition?.destroy();
        this.graphiqueComposition = null;
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
        const enregistrement$ = this.modeEdition
            ? this.recetteService.updateRecette(this.nouvelleRecetteDTO.id!, recetteEnvoyee)
            : this.recetteService.createRecette(recetteEnvoyee);

        enregistrement$.subscribe({
            next: (recette: Recette) => {
                this.appliquerRecette(recette);
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
