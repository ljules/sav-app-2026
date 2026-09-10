import { Component, Input } from '@angular/core';
import { Resultat } from '../../models/recette.model';
interface EchelleScore {
    min: number;
    max: number;
    acceptableMin: number;
    optimalMin: number;
    optimalMax: number;
    acceptableMax: number;
    description: string;
}

@Component({ selector: 'app-recipe-scores', templateUrl: './recipe-scores.html', styleUrl: './recipe-scores.css' })
export class RecipeScores {
@Input() resultats: Resultat[] = [];
    private readonly echellesScores: Record<number, EchelleScore> = {
        1: {
            min: 0, max: 100,
            acceptableMin: 41, optimalMin: 41, optimalMax: 70, acceptableMax: 70,
            description: 'Plage usuelle SoapCalc : 41 à 70',
        },
        2: {
            min: 0, max: 260,
            acceptableMin: 136, optimalMin: 136, optimalMax: 165, acceptableMax: 165,
            description: 'Plage usuelle SoapCalc : 136 à 165',
        },
    };

    private readonly echelleProprieteMendrulandia: EchelleScore = {
        min: 0, max: 20,
        acceptableMin: 8, optimalMin: 9.8, optimalMax: 10.2, acceptableMax: 12,
        description: 'Équilibre optimal : 9,8 à 10,2 ; plage acceptable : 8 à 12',
    };


    public echelleScore(idCaracteristique: number): EchelleScore {
        return this.echellesScores[idCaracteristique] ?? this.echelleProprieteMendrulandia;
    }

    public positionScore(score: number, echelle: EchelleScore): number {
        if (!Number.isFinite(score) || echelle.max <= echelle.min) {
            return 0;
        }
        const position = ((score - echelle.min) / (echelle.max - echelle.min)) * 100;
        return Math.min(100, Math.max(0, position));
    }

    public largeurZone(debut: number, fin: number, echelle: EchelleScore): number {
        return this.positionScore(fin, echelle) - this.positionScore(debut, echelle);
    }

}
