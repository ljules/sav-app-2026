import { echelleScore, positionScore, largeurZone } from '../../utils/recipe-scores';
import { Component, Input } from '@angular/core';
import { Resultat } from '../../models/recette.model';
@Component({ selector: 'app-recipe-scores', templateUrl: './recipe-scores.html', styleUrl: './recipe-scores.css' })
export class RecipeScores {
@Input() resultats: Resultat[] = [];
    echelleScore = echelleScore;
    positionScore = positionScore;
    largeurZone = largeurZone;
}
