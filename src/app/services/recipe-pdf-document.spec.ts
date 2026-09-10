import { Recette } from '../models/recette.model';
import { compositionRecette } from '../utils/recipe-composition';
import { creerDocumentRecette, donutPdf, jaugePdf, radarPdf } from './recipe-pdf-document';

describe('Recipe PDF document', () => {
  const recette: Recette = {
    id: 1, titre: 'Chèvre & miel <test>', description: 'Une description complète.',
    surgraissage: 5, apportEnEau: 7, qteAlcalin: 73, avecSoude: false,
    concentrationAlcalin: 90, dateCreation: new Date(), resultats: [],
    ligneIngredients: [{ quantite: 530, pourcentage: 100, ingredient: {
      id: 1, nom: 'Olive', estCorpsGras: true, iode: 0, ins: 0, sapo: 0,
      volMousse: 0, tenueMousse: 0, douceur: 0, lavant: 0, durete: 0, solubilite: 0, sechage: 0,
    } }],
  };

  it('includes the complete composition, total and handwritten title in A4', () => {
    const document = creerDocumentRecette(recette, { savApp: 'sav', adepro: 'adepro' });
    const content = JSON.stringify(document.content);
    expect(document.pageSize).toBe('A4');
    expect(content).toContain('JustAnotherHand');
    expect(content).toContain('610 g');
    expect(content).toContain('Potasse (KOH)');
    expect(content).toContain('86,9 %');
    expect(content).toContain('Une description complète.');
    expect(recette.ligneIngredients[0].pourcentage).toBe(100);
  });

  it('draws zero and single-component donuts without invalid geometry', () => {
    expect(donutPdf([])).not.toMatch(/NaN|Infinity/);
    const donut = donutPdf(compositionRecette(recette.ligneIngredients));
    expect(donut).toContain('r="55" fill="#8aa017"');
    expect(donut).not.toContain('<path');
  });

  it('uses the iodine scale and clamps gauge markers for out-of-range scores', () => {
    const gauge = jaugePdf({ caracteristique: { id: 1, nom: 'Iode' }, score: 200 });
    expect(gauge).toContain('x="95.5"');
    expect(gauge).not.toMatch(/NaN|Infinity/);
  });

  it('escapes radar labels and distinguishes original scores from reduced indices', () => {
    const results = [
      { caracteristique: { id: 1, nom: 'Iode' }, score: 63.2 },
      { caracteristique: { id: 2, nom: 'Indice INS' }, score: 129.6 },
      { caracteristique: { id: 3, nom: '<Douceur & test>' }, score: 8.1 },
    ];
    const radar = radarPdf(results);
    expect(radar).toContain('÷10');
    expect(radar).toContain('&lt;Douceur &amp;');
    expect(radar).not.toContain('<Douceur');
    expect(radar).not.toContain('>129<');
    expect(results[1].score).toBe(129.6);
  });
});
