import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeProfileChart } from './recipe-profile-chart';

describe('RecipeProfileChart', () => {
  let component: RecipeProfileChart;
  let fixture: ComponentFixture<RecipeProfileChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RecipeProfileChart] }).compileComponents();
    fixture = TestBed.createComponent(RecipeProfileChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('réduit au dixième les indices INS et Iode uniquement', () => {
    expect(component.libelleRadar('Indice INS')).toBe('Indice INS (÷10)');
    expect(component.valeurRadar('Indice INS', 179.5)).toBeCloseTo(17.95, 8);
    expect(component.libelleRadar('Iode')).toBe('Iode (÷10)');
    expect(component.valeurRadar('Iode', 105)).toBeCloseTo(10.5, 8);
    expect(component.valeurRadar('Douceur', 42)).toBe(42);
  });

  it('conserve les valeurs réelles dans les tooltips', () => {
    expect(component.libelleTooltip('Indice INS', 179.5))
      .toBe('Indice INS : 179.5 (valeur représentée : 17.95)');
    expect(component.libelleTooltip('Iode', 105))
      .toBe('Iode : 105 (valeur représentée : 10.5)');
  });
});
