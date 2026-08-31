import { Injectable } from '@angular/core';
import { LigneIngredient } from '../models/recette.model';

export interface ParametresCalculRecette {
  surgraissage: number;
  avecSoude: boolean;
  concentrationAlcalin: number;
}

export interface ScoresRecette {
  iode: number;
  ins: number;
  douceur: number;
  lavant: number;
  volumeMousse: number;
  tenueMousse: number;
  durete: number;
  solubilite: number;
  sechage: number;
  qteAlcalin: number;
  apportEnEau: number;
}

@Injectable({ providedIn: 'root' })
export class CalculRecetteService {
  recalculerPourcentages(lignes: LigneIngredient[]): number {
    const masseTotale = lignes.reduce(
      (total, ligne) => total + this.nombrePositif(ligne.quantite), 0,
    );

    lignes.forEach((ligne) => {
      ligne.pourcentage = masseTotale > 0
        ? +(this.nombrePositif(ligne.quantite) / masseTotale * 100).toFixed(2)
        : 0;
    });

    return masseTotale;
  }

  calculer(lignes: LigneIngredient[], parametres: ParametresCalculRecette): ScoresRecette {
    const surgraissage = this.nombrePositif(parametres.surgraissage);
    const concentration = Math.min(100, this.nombrePositif(parametres.concentrationAlcalin));
    const toutesLesLignes = lignes.filter((ligne) => !!ligne?.ingredient);
    const corpsGras = toutesLesLignes.filter((ligne) => ligne.ingredient.estCorpsGras === true);
    const score = (source: LigneIngredient[], propriete: keyof LigneIngredient['ingredient']): number =>
      source.reduce((total, ligne) =>
        total + this.nombre(ligne.ingredient[propriete]) * this.nombrePositif(ligne.pourcentage) / 100, 0);

    const qteAlcalinNormale = corpsGras.reduce((total, ligne) => {
      const quantite = this.nombrePositif(ligne.quantite);
      const sapo = this.nombre(ligne.ingredient.sapo);
      const contribution = parametres.avecSoude
        ? quantite * sapo * 40 / 56 / 1000
        : quantite * sapo / 1000;
      return total + contribution;
    }, 0);

    const qteAlcalin = concentration > 0
      ? qteAlcalinNormale / (concentration / 100) * (1 - surgraissage / 100)
      : 0;
    const apportEnEau = qteAlcalin * ((100 - concentration) / 100);

    return this.nettoyerResultat({
      iode: score(corpsGras, 'iode'),
      ins: score(corpsGras, 'ins'),
      douceur: score(corpsGras, 'douceur') * (1 + 0.01494 * surgraissage),
      lavant: score(corpsGras, 'lavant') * (1 - 0.01203 * surgraissage),
      volumeMousse: score(toutesLesLignes, 'volMousse') * (1 - 0.00702 * surgraissage),
      tenueMousse: score(toutesLesLignes, 'tenueMousse') * (1 + 0.01016 * surgraissage),
      durete: score(toutesLesLignes, 'durete') * (1 - 0.00602 * surgraissage),
      solubilite: score(corpsGras, 'solubilite') * (1 + 0.00250 * surgraissage),
      sechage: score(corpsGras, 'sechage') * (1 - 0.00503 * surgraissage),
      qteAlcalin,
      apportEnEau,
    });
  }

  private nettoyerResultat(resultat: ScoresRecette): ScoresRecette {
    return Object.fromEntries(
      Object.entries(resultat).map(([cle, valeur]) => [cle, Number.isFinite(valeur) ? valeur : 0]),
    ) as unknown as ScoresRecette;
  }

  private nombre(valeur: unknown): number {
    const nombre = Number(valeur);
    return Number.isFinite(nombre) ? nombre : 0;
  }

  private nombrePositif(valeur: unknown): number {
    return Math.max(0, this.nombre(valeur));
  }
}
