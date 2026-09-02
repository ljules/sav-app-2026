import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { RecetteService } from '../../services/recette.service';
import { RecipeManagerPage } from './recipe-manager-page';

describe('RecipeManagerPage', () => {
  let component: RecipeManagerPage;
  let fixture: ComponentFixture<RecipeManagerPage>;

  beforeEach(async () => {
    const recetteService = jasmine.createSpyObj<RecetteService>('RecetteService', ['getRecettes']);
    recetteService.getRecettes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [RecipeManagerPage],
      providers: [{ provide: RecetteService, useValue: recetteService }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeManagerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('applique une échelle de un dixième uniquement à l indice INS', () => {
    expect(component.libelleRadar('Indice INS')).toBe('Indice INS (÷10)');
    expect(component.valeurRadar('Indice INS', 179.5)).toBeCloseTo(17.95, 8);
    expect(component.valeurRadar('Douceur', 42)).toBe(42);
  });

  it('conserve la valeur INS réelle dans le tooltip', () => {
    expect(component.libelleTooltip('Indice INS', 179.5))
      .toBe('Indice INS : 179.5 (valeur représentée : 17.95)');
  });
});
