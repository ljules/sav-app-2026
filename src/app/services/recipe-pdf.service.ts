import { Injectable } from '@angular/core';
import type { TCreatedPdf } from 'pdfmake/interfaces';
import { Recette } from '../models/recette.model';

@Injectable({ providedIn: 'root' })
export class RecipePdfService {
  private ressources?: Promise<{ pdfMake: typeof import('pdfmake/build/pdfmake'); savApp: string; adepro: string }>;

  async creer(recette: Recette): Promise<TCreatedPdf> {
    const [{ pdfMake, savApp, adepro }, { creerDocumentRecette }] = await Promise.all([
      this.chargerRessources(), import('./recipe-pdf-document'),
    ]);
    return pdfMake.createPdf(creerDocumentRecette(recette, { savApp, adepro }));
  }

  nomFichier(recette: Recette): string {
    const titre = recette.titre.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
    return `fiche-recette-${titre || recette.id}.pdf`;
  }

  private chargerRessources() {
    this.ressources ??= Promise.all([
      import('pdfmake/build/pdfmake'), import('pdfmake/build/vfs_fonts'),
      this.lireAsset('fonts/just-another-hand/JustAnotherHand-Regular.ttf'),
      this.lireAsset('logos/logo.png'), this.lireAsset('logos/adepro_logo_trans.png'),
    ]).then(([module, fonts, police, savApp, adepro]) => {
      const pdfMake = module.default;
      pdfMake.addVirtualFileSystem(fonts.default);
      pdfMake.addVirtualFileSystem({ 'JustAnotherHand-Regular.ttf': police.split(',')[1] });
      pdfMake.addFonts({ JustAnotherHand: {
        normal: 'JustAnotherHand-Regular.ttf', bold: 'JustAnotherHand-Regular.ttf',
        italics: 'JustAnotherHand-Regular.ttf', bolditalics: 'JustAnotherHand-Regular.ttf',
      } });
      return { pdfMake, savApp, adepro };
    }).catch(error => {
      this.ressources = undefined; // Permit a retry after a network/loading failure.
      throw error;
    });
    return this.ressources;
  }

  private async lireAsset(path: string): Promise<string> {
    const response = await fetch(new URL(path, document.baseURI));
    if (!response.ok) throw new Error(`Chargement impossible : ${path}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
}
