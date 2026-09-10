export interface EchelleScore {
    min: number;
    max: number;
    acceptableMin: number;
    optimalMin: number;
    optimalMax: number;
    acceptableMax: number;
    description: string;
}

    const echellesScores: Record<number, EchelleScore> = {
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

    const echelleProprieteMendrulandia: EchelleScore = {
        min: 0, max: 20,
        acceptableMin: 8, optimalMin: 9.8, optimalMax: 10.2, acceptableMax: 12,
        description: 'Équilibre optimal : 9,8 à 10,2 ; plage acceptable : 8 à 12',
    };


    export function echelleScore(idCaracteristique: number): EchelleScore {
        return echellesScores[idCaracteristique] ?? echelleProprieteMendrulandia;
    }

    export function positionScore(score: number, echelle: EchelleScore): number {
        if (!Number.isFinite(score) || echelle.max <= echelle.min) {
            return 0;
        }
        const position = ((score - echelle.min) / (echelle.max - echelle.min)) * 100;
        return Math.min(100, Math.max(0, position));
    }

    export function largeurZone(debut: number, fin: number, echelle: EchelleScore): number {
        return positionScore(fin, echelle) - positionScore(debut, echelle);
    }

