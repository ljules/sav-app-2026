import { Component, EventEmitter, Output, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ImportExportCard } from '../import-export-card/import-export-card';
import { RecetteService } from '../../services/recette.service';
import { IngredientService } from '../../services/ingredient.service';
import { ProfilService } from '../../services/profil.service';
import { RecetteEchange, FichierRecettes, lireFichierRecettes, validerRecette, exporterRecette, recettesIdentiques, versDTO, identifiantValide } from '../../models/recette-echange';

@Component({
  selector: 'app-recipe-exchange',
  imports: [ImportExportCard],
  templateUrl: './recipe-exchange.html',
  styles: [` dialog { border: 0; border-radius: .5rem; padding: 0; width: min(1140px, 95vw); max-height: 90vh; }
    .modal-header, .modal-body, .modal-footer { padding: 1rem; }
    .modal-footer { gap: .5rem; }
    dialog::backdrop { background: rgba(0,0,0,.5); }
    .comparison-value { white-space: pre-wrap; overflow-wrap: anywhere; } `],
})
export class RecipeExchange implements OnDestroy {
  private recettes = inject(RecetteService);
  private ingredients = inject(IngredientService);
  private profil = inject(ProfilService);
  @Output() changed = new EventEmitter<void>();
  @ViewChild('conflict') conflict!: ElementRef<HTMLDialogElement>;
  file: File | null = null;
  busy = false;
  exporting = false;
  message = '';
  error = '';
  progress = '';
  details: string[] = [];
  rows: { label: string; current: string; incoming: string }[] = [];
  private resolveChoice?: (choice: string) => void;
  private destroyed = false;
  ngOnDestroy(): void { this.destroyed = true; this.choose('stop'); }

  select(event: Event): void {
    if (this.busy || this.exporting) return;
    this.file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.message = this.error = ''; this.details = [];
    if (this.file && !this.file.name.toLowerCase().endsWith('.json')) {
      this.error = 'Veuillez sélectionner un fichier JSON.'; this.file = null;
    }
  }
  choose(choice: string): void {
    this.conflict?.nativeElement.close();
    this.resolveChoice?.(choice); this.resolveChoice = undefined;
  }
  askConflict(): Promise<string> {
    return new Promise(resolve => { this.resolveChoice = resolve; this.conflict.nativeElement.showModal(); });
  }
  async export(): Promise<void> {
    if (this.busy || this.exporting) return;
    this.exporting = true; this.error = ''; this.message = '';
    try {
      const [user, recipes] = await Promise.all([firstValueFrom(this.profil.getProfil()), firstValueFrom(this.recettes.getRecettes())]);
      if (this.destroyed) return;
      if (!identifiantValide(user.id)) throw new Error('Identité du compte connecté indisponible.');
      const entries = recipes.map(r => exporterRecette(r, user.id));
      entries.forEach(validerRecette);
      const data: FichierRecettes = { format: 'sav-app-recettes', version: '1.0.0', exporteLe: new Date().toISOString(), recettes: entries };
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url;
      link.download = `recettes_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.message = `${entries.length} recette(s) exportée(s).`;
    } catch { this.error = 'Export impossible. Vérifiez les données et la disponibilité de l’API.'; }
    finally { this.exporting = false; }
  }
  async import(): Promise<void> {
    if (!this.file || this.busy || this.exporting) return;
    this.busy = true; this.error = this.message = ''; this.details = [];
    let created = 0, replaced = 0, skipped = 0, errors = 0, processed = 0;
    let entries: unknown[] = [];
    let started = false;
    try {
      entries = lireFichierRecettes(await this.file.text());
      // Valider toutes les entrées avant la première écriture, sans bloquer les autres recettes.
      const prepared = entries.map(entry => {
        try { validerRecette(entry); return { recipe: entry, error: '' }; }
        catch (e) { return { recipe: null, error: (e as Error).message }; }
      });
      const [user, existing, catalog] = await Promise.all([
        firstValueFrom(this.profil.getProfil()), firstValueFrom(this.recettes.getRecettes()), firstValueFrom(this.ingredients.getIngredients())]);
      if (!identifiantValide(user.id)) throw new Error('Identité du compte connecté indisponible.');
      const own = new Map(existing.map(r => [r.id, exporterRecette(r, user.id)]));
      const names = new Map(catalog.map(i => [i.id, i.nom]));
      started = true;
      for (let index = 0; index < prepared.length && !this.destroyed; index++) {
        const item = prepared[index]; const r = item.recipe;
        const raw = entries[index] as Partial<RecetteEchange> | null;
        const label = `Entrée ${index + 1}${typeof raw?.titre === 'string' ? ' — ' + raw.titre : ''}${identifiantValide(raw?.id) ? ' (ID ' + raw.id + ')' : ''}`;
        this.progress = `Traitement de la recette ${index + 1} sur ${entries.length}`;
        const missing = r?.ligneIngredients.filter(l => !names.has(l.ingredientId)).map(l => l.ingredientId) ?? [];
        if (!r || missing.length) {
          errors++; processed++;
          this.details.push(`${label} : ${item.error || 'Ingrédient(s) absent(s) : ' + missing.join(', ')} Recette ignorée.`);
          continue;
        }
        const current = r.utilisateurId === user.id && r.id ? own.get(r.id) : undefined;
        if (current && recettesIdentiques(current, r)) { skipped++; processed++; continue; }
        if (current) {
          this.rows = this.comparison(current, r, names);
          const choice = await this.askConflict();
          if (choice === 'stop' || this.destroyed) break;
          if (choice === 'skip') { skipped++; processed++; continue; }
        }
        if (this.destroyed) break;
        try {
          const saved = await firstValueFrom(current
            ? this.recettes.updateRecette(current.id!, versDTO(r))
            : this.recettes.createRecette(versDTO(r)));
          own.set(saved.id, exporterRecette(saved, user.id));
          current ? replaced++ : created++;
          processed++;
          this.changed.emit();
        } catch {
          errors++; processed++;
          this.details.push(`${label} : enregistrement non confirmé par l’API. Vérifiez la liste avant de réessayer.`);
          this.error = 'Import interrompu après une erreur API ; les opérations précédentes sont conservées.';
          this.changed.emit();
          break;
        }
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Impossible de charger le profil, les recettes ou les ingrédients.';
    } finally {
      if (started) this.message = `${created} créée(s), ${replaced} remplacée(s), ${skipped} ignorée(s), ${errors} en erreur, ${entries.length - processed} non traitée(s).`;
      this.progress = ''; this.busy = false;
    }
  }
  private comparison(a: RecetteEchange, b: RecetteEchange, names: Map<number,string>) {
    const composition = (r: RecetteEchange) => r.ligneIngredients.map(l => `${names.get(l.ingredientId) ?? 'Ingrédient absent'} (ID ${l.ingredientId}) : ${l.quantite} g`).join('\n');
    const fields = (r: RecetteEchange) => [r.titre, r.description, `${r.surgraissage} %`, r.avecSoude ? 'Soude (NaOH)' : 'Potasse (KOH)', `${r.concentrationAlcalin} %`, composition(r)];
    const left = fields(a), right = fields(b);
    return ['Titre','Description','Surgraissage','Alcalin','Concentration de l’alcali','Composition'].map((label,i) => ({ label, current: left[i], incoming: right[i] }));
  }
}
