import { Component, Input, OnChanges } from '@angular/core';
import { LigneIngredient } from '../../models/recette.model';

@Component({
  selector: 'app-recipe-composition',
  template: `
    <div class="composition" [class.detailed]="detailed">
      <ul aria-label="Ingrédients et proportions">
        @for (item of items; track $index) {
          <li [title]="item.label"><span class="dot" [style.background]="item.color" aria-hidden="true"></span>
            <span class="name">{{ item.name }}</span><span class="percentage">{{ item.percent }} %</span>
          </li>
        }
      </ul>
      <div class="donut" [style.background]="gradient" aria-hidden="true"><span></span></div>
    </div>`,
  styles: [`
    :host { display: block; min-width: 0; }
    .composition { display: grid; grid-template-columns: minmax(0, 1fr) 100px; gap: .5rem; align-items: center; height: 155px; }
    ul { padding: 0; margin: 0; list-style: none; max-height: 155px; overflow-y: auto; }
    li { display: flex; align-items: center; gap: .25rem; font-size: .65rem; padding: .2rem 0; }
    .dot { width: .6rem; height: .6rem; flex-shrink: 0; border-radius: 50%; }
    .name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .percentage { margin-left: auto; white-space: nowrap; color: #595959; }
    .donut { width: 100px; height: 100px; border-radius: 50%; display: grid; place-items: center; }
    .donut span { width: 48%; height: 48%; border-radius: 50%; background: white; }
    .detailed { grid-template-columns: minmax(0, 1fr) minmax(100px, 42%); height: auto; gap: 1rem; }
    .detailed ul { max-height: none; overflow: visible; }
    .detailed li { font-size: 1rem; gap: .5rem; padding: .4rem 0; }
    .detailed .name { white-space: normal; overflow-wrap: anywhere; }
    .detailed .dot { width: .85rem; height: .85rem; }
    .detailed .donut { width: 100%; height: auto; aspect-ratio: 1; }
    @media(max-width: 575px) { .detailed { grid-template-columns: 1fr; } .detailed .donut { display: grid; width: 160px; margin: auto; } }
    @media(max-width: 380px) { .composition { grid-template-columns: minmax(0, 1fr); height: auto; } .donut { display: none; } }
  `],
})
export class RecipeComposition implements OnChanges {
  @Input() lignes: LigneIngredient[] = [];
  @Input() detailed = false;
  @Input() eau: number | null = null;
  @Input() alcalin: number | null = null;
  @Input() avecSoude = true;
  items: { name: string; percent: string; color: string; label: string }[] = [];
  gradient = '#eee';
  ngOnChanges(): void {
    const colors = ['#8aa017','#7e1fa2','#087cff','#ffbf00','#e66a43','#219e91','#c75489','#5268a4','#966b35','#648441'];
    const masses = this.lignes.map(l => ({ name: l.ingredient.nom, quantite: l.quantite }));
    if (this.eau !== null) masses.push({ name: 'Eau', quantite: this.eau });
    if (this.alcalin !== null) masses.push({ name: this.avecSoude ? 'Soude (NaOH)' : 'Potasse (KOH)', quantite: this.alcalin });
    const total = masses.reduce((sum, l) => sum + Math.max(0, l.quantite), 0);
    let offset = 0;
    const stops: string[] = [];
    this.items = masses.map((l, i) => {
      const value = total > 0 ? Math.max(0, l.quantite) / total * 100 : 0;
      const color = colors[i % colors.length];
      stops.push(`${color} ${offset}% ${offset + value}%`); offset += value;
      const percent = value.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
      return { name: l.name, color, percent, label: `${l.name} : ${l.quantite} g (${percent} %)` };
    });
    this.gradient = total > 0 ? `conic-gradient(${stops.join(',')})` : '#eee';
  }
}
