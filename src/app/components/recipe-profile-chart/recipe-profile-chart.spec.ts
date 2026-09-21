import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeProfileChart } from './recipe-profile-chart';
import { Chart } from 'chart.js';

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

  it('affiche et actualise un radar avec les composants Chart.js sélectionnés', () => {
    fixture.componentRef.setInput('resultats', [
      { caracteristique: { id: 1, nom: 'Douceur' }, score: 5 },
      { caracteristique: { id: 2, nom: 'Dureté' }, score: 7 },
      { caracteristique: { id: 3, nom: 'Lavant' }, score: 3 },
    ]);
    fixture.detectChanges();
    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    const chart = Chart.getChart(canvas)!;
    expect(chart).toBeDefined();
    expect(chart.data.datasets[0].data).toEqual([5, 7, 3]);
    expect(chart.isPluginEnabled('filler')).toBeTrue();
    expect(chart.isPluginEnabled('tooltip')).toBeTrue();

    fixture.componentRef.setInput('resultats', [
      { caracteristique: { id: 1, nom: 'Douceur' }, score: 8 },
    ]);
    fixture.detectChanges();
    expect(chart.data.datasets[0].data).toEqual([8]);
    fixture.destroy();
    expect(Chart.getChart(canvas)).toBeUndefined();
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
