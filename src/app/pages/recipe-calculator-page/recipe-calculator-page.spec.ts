import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { IngredientService } from '../../services/ingredient.service';
import { RecetteService } from '../../services/recette.service';
import { RecipeCalculatorPage } from './recipe-calculator-page';

describe('RecipeCalculatorPage', () => {
    let component: RecipeCalculatorPage;
    let fixture: ComponentFixture<RecipeCalculatorPage>;
    let authService: jasmine.SpyObj<AuthService>;

    beforeEach(async () => {
        authService = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated']);
        authService.isAuthenticated.and.returnValue(true);
        const ingredientService = jasmine.createSpyObj<IngredientService>('IngredientService', ['getIngredients']);
        ingredientService.getIngredients.and.returnValue(of([]));
        const recetteService = jasmine.createSpyObj<RecetteService>('RecetteService', ['createRecette']);

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

    it('masque le titre et la description pour un visiteur', () => {
        authService.isAuthenticated.and.returnValue(false);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#titre')).toBeNull();
        expect(fixture.nativeElement.querySelector('#description')).toBeNull();
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
});
