import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Recette } from '../../models/recette.model';
import { AuthService } from '../../services/auth.service';
import { IngredientService } from '../../services/ingredient.service';
import { RecetteService } from '../../services/recette.service';
import { RecipeCalculatorPage } from './recipe-calculator-page';

describe('RecipeCalculatorPage', () => {
    let component: RecipeCalculatorPage;
    let fixture: ComponentFixture<RecipeCalculatorPage>;
    let authService: jasmine.SpyObj<AuthService>;
    let recetteService: jasmine.SpyObj<RecetteService>;

    beforeEach(async () => {
        authService = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated']);
        authService.isAuthenticated.and.returnValue(true);
        const ingredientService = jasmine.createSpyObj<IngredientService>('IngredientService', ['getIngredients']);
        ingredientService.getIngredients.and.returnValue(of([]));
        recetteService = jasmine.createSpyObj<RecetteService>('RecetteService', ['createRecette']);

        await TestBed.configureTestingModule({
            imports: [RecipeCalculatorPage],
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: IngredientService, useValue: ingredientService },
                { provide: RecetteService, useValue: recetteService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(RecipeCalculatorPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('interdit un surgraissage négatif', () => {
        component.mettreAJourSurgraissage(-3);
        expect(component.nouvelleRecetteDTO.surgraissage).toBe(0);
    });

    it('interdit une concentration négative', () => {
        component.mettreAJourConcentration(-10);
        expect(component.nouvelleRecetteDTO.concentrationAlcalin).toBe(0);
    });

    it('initialise la concentration à 90 lors du choix de la soude', () => {
        component.choisirAlcalin(true);
        expect(component.nouvelleRecetteDTO.avecSoude).toBeTrue();
        expect(component.nouvelleRecetteDTO.concentrationAlcalin).toBe(90);
    });

    it('initialise une nouvelle recette avec les valeurs recommandées', () => {
        expect(component.nouvelleRecetteDTO.surgraissage).toBe(5);
        expect(component.nouvelleRecetteDTO.avecSoude).toBeTrue();
        expect(component.nouvelleRecetteDTO.concentrationAlcalin).toBe(90);
    });

    it('masque le titre et la description pour un visiteur', () => {
        authService.isAuthenticated.and.returnValue(false);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#titre')).toBeNull();
        expect(fixture.nativeElement.querySelector('#description')).toBeNull();
        expect(fixture.nativeElement.querySelector('.recipe-submit-button')).toBeNull();
        expect(fixture.nativeElement.textContent).toContain(
            'Connectez-vous ou inscrivez-vous pour enregistrer votre recette.');
    });

    it('affiche le bouton de soumission pour un utilisateur connecté', () => {
        expect(fixture.nativeElement.querySelector('.recipe-submit-button')).not.toBeNull();
    });

    it('calcule les pourcentages en mode masse', () => {
        const ingredient = {
            id: 1, nom: 'Olive', iode: 0, ins: 0, sapo: 0, volMousse: 0,
            tenueMousse: 0, douceur: 0, lavant: 0, durete: 0,
            solubilite: 0, sechage: 0, estCorpsGras: true,
        };
        component.selectionIngredients = [
            { ingredient, quantite: 300, pourcentage: 0 },
            { ingredient: { ...ingredient, id: 2 }, quantite: 100, pourcentage: 0 },
        ];
        component.recalculerPourcentages();
        expect(component.masseTotale).toBe(400);
        expect(component.selectionIngredients.map((ligne) => ligne.pourcentage)).toEqual([75, 25]);
    });

    it('calcule les masses en mode pourcentage', () => {
        const ingredient = {
            id: 1, nom: 'Olive', iode: 0, ins: 0, sapo: 0, volMousse: 0,
            tenueMousse: 0, douceur: 0, lavant: 0, durete: 0,
            solubilite: 0, sechage: 0, estCorpsGras: true,
        };
        component.selectionIngredients = [
            { ingredient, quantite: 0, pourcentage: 60 },
            { ingredient: { ...ingredient, id: 2 }, quantite: 0, pourcentage: 40 },
        ];
        component.modeDosage = 'pourcentage';
        component.mettreAJourMasseTotale(500);
        expect(component.selectionIngredients.map((ligne) => ligne.quantite)).toEqual([300, 200]);
        expect(component.pourcentageValide).toBeTrue();
    });

    it('filtre la liste d ajout par type et exclut les ingrédients déjà choisis', () => {
        const corpsGras = {
            id: 1, nom: 'Olive', iode: 78, ins: 111, sapo: 189, volMousse: 0,
            tenueMousse: 0, douceur: 0, lavant: 0, durete: 0,
            solubilite: 0, sechage: 0, estCorpsGras: true,
        };
        const adjuvant = { ...corpsGras, id: 2, nom: 'Argile', estCorpsGras: false };
        component.ingredientsDispo = [corpsGras, adjuvant];
        component.afficherAdjuvants = false;
        expect(component.ingredientsDisponiblePourAjout).toEqual([corpsGras]);

        component.selectionIngredients = [{ ingredient: corpsGras, quantite: 0, pourcentage: 0 }];
        expect(component.ingredientsDisponiblePourAjout).toEqual([]);
    });

    it('applique le filtre numérique aux seuls corps gras', () => {
        const olive = {
            id: 1, nom: 'Olive', iode: 78, ins: 111, sapo: 189, volMousse: 0,
            tenueMousse: 0, douceur: 0, lavant: 0, durete: 0,
            solubilite: 0, sechage: 0, estCorpsGras: true,
        };
        const coco = { ...olive, id: 2, nom: 'Coco', sapo: 257 };
        const argile = { ...olive, id: 3, nom: 'Argile', sapo: 200, estCorpsGras: false };
        component.ingredientsDispo = [olive, coco, argile];
        component.valeurMin = 200;
        component.valeurMax = 280;
        component.basculerFiltreNumerique();

        expect(component.ingredientsDisponiblePourAjout).toEqual([coco]);
    });

    it('refuse l activation d une plage numérique incohérente', () => {
        component.valeurMin = 200;
        component.valeurMax = 100;
        component.basculerFiltreNumerique();
        expect(component.filtreNumeriqueActif).toBeFalse();
    });

    it('actualise immédiatement les scores lors d une modification', () => {
        const ingredient = {
            id: 1, nom: 'Olive', iode: 78, ins: 111, sapo: 189, volMousse: 9.838,
            tenueMousse: 9.152, douceur: 9.26, lavant: 10.192, durete: 10.144,
            solubilite: 9.298, sechage: 10.194, estCorpsGras: true,
        };
        component.selectionIngredients = [{ ingredient, quantite: 100, pourcentage: 0 }];
        component.recalculerPourcentages();

        const iode = component.recetteAffichee?.resultats.find(
            (resultat) => resultat.caracteristique.nom === 'Iode');
        expect(iode?.score).toBeCloseTo(78, 8);
    });

    it('utilise les plages SoapCalc pour l iode et l INS', () => {
        expect(component.echelleScore(1)).toEqual(jasmine.objectContaining({
            min: 0, max: 100, optimalMin: 41, optimalMax: 70,
        }));
        expect(component.echelleScore(2)).toEqual(jasmine.objectContaining({
            min: 0, max: 260, optimalMin: 136, optimalMax: 165,
        }));
    });

    it('utilise l échelle Mendrulandia convertie et borne le marqueur visuel', () => {
        const echelle = component.echelleScore(3);
        expect(echelle).toEqual(jasmine.objectContaining({
            min: 0, max: 20, acceptableMin: 8, optimalMin: 9.8,
            optimalMax: 10.2, acceptableMax: 12,
        }));
        expect(component.positionScore(10, echelle)).toBe(50);
        expect(component.positionScore(-1, echelle)).toBe(0);
        expect(component.positionScore(25, echelle)).toBe(100);
    });

    it('affiche le modal de succès après la réponse officielle du backend', () => {
        const ingredient = {
            id: 1, nom: 'Olive', iode: 0, ins: 0, sapo: 0, volMousse: 0,
            tenueMousse: 0, douceur: 0, lavant: 0, durete: 0,
            solubilite: 0, sechage: 0, estCorpsGras: true,
        };
        const recette: Recette = {
            id: 10, titre: 'Test', description: '', surgraissage: 5,
            avecSoude: true, concentrationAlcalin: 30, qteAlcalin: 10,
            apportEnEau: 7, ligneIngredients: [{ ingredient, quantite: 100, pourcentage: 100 }],
            resultats: [], dateCreation: new Date(),
        };
        recetteService.createRecette.and.returnValue(of(recette));

        component.onSubmit();

        expect(component.resultatEnvoi).toBe('succes');
        expect(component.recetteAffichee).toBe(recette);
    });

    it('affiche le modal d erreur lorsque l API refuse la recette', () => {
        recetteService.createRecette.and.returnValue(throwError(() => new Error('API indisponible')));

        component.onSubmit();

        expect(component.resultatEnvoi).toBe('erreur');
    });
});
