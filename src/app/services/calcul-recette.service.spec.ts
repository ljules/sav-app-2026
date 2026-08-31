import { Ingredient } from '../models/ingredient.model';
import { LigneIngredient } from '../models/recette.model';
import { CalculRecetteService } from './calcul-recette.service';

describe('CalculRecetteService', () => {
  let service: CalculRecetteService;

  const coco: Ingredient = {
    id: 1, nom: 'Coco', iode: 9, ins: 248, sapo: 257,
    volMousse: 13.326, tenueMousse: 9.560, lavant: 14.462,
    douceur: 7.746, durete: 9.390, solubilite: 11.204,
    sechage: 11.880, estCorpsGras: true,
  };
  const olive: Ingredient = {
    id: 2, nom: 'Olive', iode: 78, ins: 111, sapo: 189,
    volMousse: 9.838, tenueMousse: 9.152, lavant: 10.192,
    douceur: 9.260, durete: 10.144, solubilite: 9.298,
    sechage: 10.194, estCorpsGras: true,
  };
  const recetteReference = (): LigneIngredient[] => [
    { ingredient: coco, quantite: 500, pourcentage: 50 },
    { ingredient: olive, quantite: 500, pourcentage: 50 },
  ];

  beforeEach(() => service = new CalculRecetteService());

  it('reproduit la recette de référence Coco et Olive', () => {
    const resultat = service.calculer(recetteReference(), {
      surgraissage: 0, avecSoude: true, concentrationAlcalin: 30,
    });

    expect(resultat.iode).toBeCloseTo(43.5, 6);
    expect(resultat.ins).toBeCloseTo(179.5, 6);
    expect(resultat.douceur).toBeCloseTo(8.503, 6);
    expect(resultat.lavant).toBeCloseTo(12.327, 6);
    expect(resultat.volumeMousse).toBeCloseTo(11.582, 6);
    expect(resultat.tenueMousse).toBeCloseTo(9.356, 6);
    expect(resultat.durete).toBeCloseTo(9.767, 6);
    expect(resultat.solubilite).toBeCloseTo(10.251, 6);
    expect(resultat.sechage).toBeCloseTo(11.037, 6);
    expect(resultat.qteAlcalin).toBeCloseTo(530.95238, 4);
    expect(resultat.apportEnEau).toBeCloseTo(371.66667, 4);
  });

  it('applique le surgraissage aux scores et à la quantité d alcalin', () => {
    const sansSurgraissage = service.calculer(recetteReference(), {
      surgraissage: 0, avecSoude: true, concentrationAlcalin: 30,
    });
    const avecSurgraissage = service.calculer(recetteReference(), {
      surgraissage: 10, avecSoude: true, concentrationAlcalin: 30,
    });

    expect(avecSurgraissage.douceur).toBeCloseTo(sansSurgraissage.douceur * 1.1494, 8);
    expect(avecSurgraissage.lavant).toBeCloseTo(sansSurgraissage.lavant * 0.8797, 8);
    expect(avecSurgraissage.qteAlcalin).toBeCloseTo(sansSurgraissage.qteAlcalin * 0.9, 8);
  });

  it('calcule la potasse sans le coefficient NaOH', () => {
    const resultat = service.calculer(recetteReference(), {
      surgraissage: 0, avecSoude: false, concentrationAlcalin: 30,
    });
    expect(resultat.qteAlcalin).toBeCloseTo(743.333333, 5);
  });

  it('exclut un adjuvant des scores corps gras mais l inclut dans mousse et dureté', () => {
    const adjuvant: Ingredient = {
      ...coco, id: 3, nom: 'Adjuvant', estCorpsGras: false,
      iode: 100, ins: 100, douceur: 100, lavant: 100,
      solubilite: 100, sechage: 100, volMousse: 100,
      tenueMousse: 100, durete: 100,
    };
    const resultat = service.calculer([
      { ingredient: coco, quantite: 50, pourcentage: 50 },
      { ingredient: adjuvant, quantite: 50, pourcentage: 50 },
    ], { surgraissage: 0, avecSoude: true, concentrationAlcalin: 30 });

    expect(resultat.iode).toBeCloseTo(coco.iode * 0.5, 8);
    expect(resultat.ins).toBeCloseTo(coco.ins * 0.5, 8);
    expect(resultat.douceur).toBeCloseTo(coco.douceur * 0.5, 8);
    expect(resultat.lavant).toBeCloseTo(coco.lavant * 0.5, 8);
    expect(resultat.solubilite).toBeCloseTo(coco.solubilite * 0.5, 8);
    expect(resultat.sechage).toBeCloseTo(coco.sechage * 0.5, 8);
    expect(resultat.volumeMousse).toBeCloseTo((coco.volMousse + 100) * 0.5, 8);
    expect(resultat.tenueMousse).toBeCloseTo((coco.tenueMousse + 100) * 0.5, 8);
    expect(resultat.durete).toBeCloseTo((coco.durete + 100) * 0.5, 8);
  });

  it('retourne des valeurs neutres pour une recette vide', () => {
    const resultat = service.calculer([], {
      surgraissage: 0, avecSoude: true, concentrationAlcalin: 30,
    });
    expect(Object.values(resultat).every((valeur) => valeur === 0)).toBeTrue();
  });

  it('gère une somme de quantités nulle', () => {
    const lignes = recetteReference().map((ligne) => ({ ...ligne, quantite: 0 }));
    expect(service.recalculerPourcentages(lignes)).toBe(0);
    expect(lignes.map((ligne) => ligne.pourcentage)).toEqual([0, 0]);
  });

  it('neutralise alcalin et eau pour une concentration nulle', () => {
    const resultat = service.calculer(recetteReference(), {
      surgraissage: 0, avecSoude: true, concentrationAlcalin: 0,
    });
    expect(resultat.qteAlcalin).toBe(0);
    expect(resultat.apportEnEau).toBe(0);
  });

  it('recalcule les pourcentages après modification d une quantité', () => {
    const lignes = recetteReference();
    lignes[0].quantite = 1500;
    expect(service.recalculerPourcentages(lignes)).toBe(2000);
    expect(lignes[0].pourcentage).toBeCloseTo(75, 8);
    expect(lignes[1].pourcentage).toBeCloseTo(25, 8);
  });
});
