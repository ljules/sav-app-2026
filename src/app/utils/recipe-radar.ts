export function estIndiceIns(nom: string): boolean {
  return nom.trim().toLocaleUpperCase('fr').includes('INS');
}

export function estIndiceReduit(nom: string): boolean {
  return estIndiceIns(nom) || nom.trim().toLocaleUpperCase('fr').includes('IODE');
}

export function libelleRadar(nom: string): string {
  return estIndiceReduit(nom) ? (estIndiceIns(nom) ? 'Indice INS (÷10)' : 'Iode (÷10)') : nom;
}

export function valeurRadar(nom: string, score: number): number {
  return estIndiceReduit(nom) ? score / 10 : score;
}
