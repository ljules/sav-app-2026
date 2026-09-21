import { libelleRadar, valeurRadar, estIndiceIns, estIndiceReduit } from '../../utils/recipe-radar';
import { Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Chart, Filler, LineElement, PointElement, RadarController, RadialLinearScale, Tooltip } from 'chart.js';
import { Resultat } from '../../models/recette.model';

Chart.register(RadarController, RadialLinearScale, LineElement, PointElement, Filler, Tooltip);

@Component({
  selector: 'app-recipe-profile-chart',
  templateUrl: './recipe-profile-chart.html',
  styleUrl: './recipe-profile-chart.css',
})
export class RecipeProfileChart implements OnChanges, OnDestroy {
  @Input() resultats: Resultat[] = [];
  @Input() afficherGraphique = true;
  @Input() compact = false;

  private graphique: Chart | null = null;
  private canvas: HTMLCanvasElement | null = null;

  @ViewChild('profileChart')
  set profileChart(element: ElementRef<HTMLCanvasElement> | undefined) {
    if (!element) {
      this.detruireGraphique();
      this.canvas = null;
      return;
    }
    this.canvas = element.nativeElement;
    this.mettreAJourGraphique();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['compact']) this.detruireGraphique();
    if (changes['resultats'] || changes['afficherGraphique'] || changes['compact']) {
      this.mettreAJourGraphique();
    }
  }

  ngOnDestroy(): void {
    this.detruireGraphique();
  }

  libelleRadar = libelleRadar;
  valeurRadar = valeurRadar;

  public libelleTooltip(nomCaracteristique: string, score: number): string {
    if (!estIndiceReduit(nomCaracteristique)) {
      return `${nomCaracteristique} : ${score}`;
    }
    const libelle = estIndiceIns(nomCaracteristique) ? 'Indice INS' : 'Iode';
    return `${libelle} : ${score} (valeur représentée : ${score / 10})`;
  }

  private mettreAJourGraphique(): void {
    if (!this.canvas || !this.afficherGraphique || this.resultats.length === 0) return;

    const labels = this.resultats.map(({ caracteristique }) =>
      this.libelleRadar(caracteristique.nom));
    const valeurs = this.resultats.map(({ caracteristique, score }) =>
      this.valeurRadar(caracteristique.nom, score));

    if (this.graphique) {
      this.graphique.data.labels = labels;
      this.graphique.data.datasets[0].data = valeurs;
      this.graphique.update();
      return;
    }

    this.graphique = new Chart(this.canvas, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Scores',
          data: valeurs,
          fill: true,
          backgroundColor: 'rgba(210, 0, 255, 0.2)',
          borderColor: 'rgb(210, 0, 255)',
          pointBackgroundColor: 'rgb(0, 180, 0)',
          pointBorderColor: 'rgb(0, 180, 0)',
          pointHoverBackgroundColor: 'rgb(255, 255, 255)',
          pointHoverBorderColor: 'rgb(0, 180, 0)',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: { line: { borderWidth: 2 } },
        scales: { r: { suggestedMin: 0, suggestedMax: 10, pointLabels: { display: !this.compact }, ticks: { stepSize: this.compact ? 2 : 1, font: { size: this.compact ? 8 : 12 }, backdropColor: this.compact ? 'transparent' : 'white' } } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (contexte) => {
                const resultat = this.resultats[contexte.dataIndex];
                return this.libelleTooltip(resultat.caracteristique.nom, resultat.score);
              },
            },
          },
        },
      },
    });
  }

  private detruireGraphique(): void {
    this.graphique?.destroy();
    this.graphique = null;
  }
}
