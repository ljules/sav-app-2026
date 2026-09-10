import { Recette } from '../../models/recette.model';
import { RecipeComposition } from '../../components/recipe-composition/recipe-composition';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { RecetteService } from '../../services/recette.service';
import { RecipeManagerPage } from './recipe-manager-page';
import { provideRouter } from '@angular/router';

describe('RecipeManagerPage', () => {
  let component: RecipeManagerPage;
  let fixture: ComponentFixture<RecipeManagerPage>;

  beforeEach(async () => {
    const recetteService = jasmine.createSpyObj<RecetteService>('RecetteService', ['getRecettes']);
    recetteService.getRecettes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [RecipeManagerPage],
      providers: [
        { provide: RecetteService, useValue: recetteService },
        provideRouter([]),
        provideHttpClient(),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeManagerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const recette: Recette = {
    id: 1, titre: 'Recette de test', description: 'Description de test',
    surgraissage: 5, apportEnEau: 7, qteAlcalin: 73, avecSoude: true,
    concentrationAlcalin: 90, dateCreation: new Date(), resultats: [],
    ligneIngredients: [{ quantite: 530, pourcentage: 100, ingredient: {
      id: 1, nom: 'Olive', estCorpsGras: true, iode: 0, ins: 0, sapo: 0,
      volMousse: 0, tenueMousse: 0, douceur: 0, lavant: 0, durete: 0, solubilite: 0, sechage: 0,
    } }],
  };

  it('includes water and alkali in the total and donut without modifying the recipe', () => {
    component.ouvrirModale(recette);
    fixture.detectChanges();
    expect(component.masseTotaleDetails).toBe(610);
    const donut = fixture.debugElement.query(By.directive(RecipeComposition)).componentInstance as RecipeComposition;
    expect(donut.items.map(item => item.percent)).toEqual(['86,9', '1,1', '12']);
    expect(donut.items.map(item => item.name)).toEqual(['Olive', 'Eau', 'Soude (NaOH)']);
    expect(recette.ligneIngredients.length).toBe(1);
    expect(recette.ligneIngredients[0].pourcentage).toBe(100);
    expect(fixture.nativeElement.querySelector('tfoot').textContent).toContain('610 g');
  });

  it('navigates in the same modal and resets to composition on reopening', () => {
    component.ouvrirModale(recette);
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('#modalDetails');
    const next = modal.querySelector('.detail-navigation');
    next.click(); fixture.detectChanges();
    expect(component.pageDetails).toBe('profil');
    expect(modal.querySelector('app-recipe-scores')).toBeTruthy();
    expect(modal.querySelector('app-recipe-profile-chart')).toBeTruthy();
    expect(modal.querySelector('table')).toBeNull();
    next.click(); fixture.detectChanges();
    expect(component.pageDetails).toBe('composition');
    next.click(); fixture.detectChanges();
    component.fermerModale(); component.ouvrirModale(recette); fixture.detectChanges();
    expect(component.pageDetails).toBe('composition');
    expect(modal.querySelector('.detail-pdf').disabled).toBeTrue();
  });

  it('labels potash correctly and handles a zero total', () => {
    component.ouvrirModale({ ...recette, avecSoude: false, ligneIngredients: [], apportEnEau: 0, qteAlcalin: 0 });
    fixture.detectChanges();
    const donut = fixture.debugElement.query(By.directive(RecipeComposition)).componentInstance as RecipeComposition;
    expect(donut.items.map(item => item.name)).toEqual(['Eau', 'Potasse (KOH)']);
    expect(donut.items.every(item => item.percent === '0')).toBeTrue();
    expect(donut.gradient).toBe('#eee');
  });});
