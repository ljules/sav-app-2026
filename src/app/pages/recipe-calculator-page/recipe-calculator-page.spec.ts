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
});
