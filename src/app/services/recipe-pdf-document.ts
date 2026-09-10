import type { Content, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';
import { Recette, Resultat } from '../models/recette.model';
import { compositionRecette } from '../utils/recipe-composition';
import { echelleScore, positionScore } from '../utils/recipe-scores';
import { libelleRadar, valeurRadar } from '../utils/recipe-radar';

const green = '#8aa017';
const purple = '#7e1fa2';
const number = (value: number) => value.toLocaleString('fr-FR', { maximumFractionDigits: 2 }).replace(/\u202f/g, ' ');
const xml = (text: string) => text.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);
const svg = (width: number, height: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;

export function donutPdf(values: ReturnType<typeof compositionRecette>): string {
  let angle = -Math.PI / 2;
  const slices = values.filter(item => item.value > 0).map(item => {
    if (item.value >= 99.999999) return `<circle cx="60" cy="60" r="55" fill="${item.color}"/>`;
    const start = angle;
    angle += item.value / 100 * Math.PI * 2;
    return `<path d="M60 60 L${60 + 55 * Math.cos(start)} ${60 + 55 * Math.sin(start)} A55 55 0 ${item.value > 50 ? 1 : 0} 1 ${60 + 55 * Math.cos(angle)} ${60 + 55 * Math.sin(angle)} Z" fill="${item.color}"/>`;
  }).join('');
  return svg(120, 120, `<circle cx="60" cy="60" r="55" fill="#eee"/>${slices}<circle cx="60" cy="60" r="27" fill="white"/>`);
}

export function jaugePdf(resultat: Resultat): string {
  const scale = echelleScore(resultat.caracteristique.id);
  const x = (value: number) => 3 + positionScore(value, scale) * .94;
  const band = (a: number, b: number, color: string) => `<rect x="${x(a)}" y="5" width="${x(b) - x(a)}" height="7" fill="${color}"/>`;
  return svg(100, 17, `<rect x="3" y="5" width="94" height="7" rx="3.5" fill="#e82d49"/>` +
    band(scale.acceptableMin, scale.acceptableMax, '#ffc107') + band(scale.optimalMin, scale.optimalMax, '#198754') +
    `<rect x="${x(resultat.score) - 1.5}" y="3" width="3" height="11" rx="1" stroke="#777" stroke-width=".5" fill="white"/><rect x="${x(resultat.score) - .5}" y="4" width="1" height="9" fill="#343a40"/>`);
}

export function radarPdf(resultats: Resultat[]): string {
  if (resultats.length < 3) return svg(250, 210, '<text x="125" y="105" text-anchor="middle" font-family="Roboto" font-size="10">Profil non disponible</text>');
  const values = resultats.map(r => valeurRadar(r.caracteristique.nom, r.score));
  const max = Math.max(10, Math.ceil(Math.max(...values)));
  const point = (i: number, radius: number) => {
    const angle = -Math.PI / 2 + i * Math.PI * 2 / values.length;
    return [125 + radius * Math.cos(angle), 104 + radius * Math.sin(angle)];
  };
  let body = '';
  // Bound the number of rings for unusual imported scores.
  const step = Math.max(1, Math.ceil(max / 20));
  for (let level = step; level <= max; level += step) {
    body += `<polygon points="${values.map((_, i) => point(i, 72 * level / max).join(',')).join(' ')}" fill="none" stroke="#e2e2e2" stroke-width=".6"/>`;
    body += `<text x="128" y="${104 - 72 * level / max}" font-family="Roboto" font-size="6" fill="#888">${level}</text>`;
  }
  resultats.forEach((r, i) => {
    const [x, y] = point(i, 72);
    const [lx, ly] = point(i, 94);
    const words = libelleRadar(r.caracteristique.nom).split(' ');
    const label = words.length > 2 ? [words.slice(0, -1).join(' '), words.at(-1)!] : [words.join(' ')];
    body += `<line x1="125" y1="104" x2="${x}" y2="${y}" stroke="#e2e2e2" stroke-width=".6"/>`;
    body += `<text x="${lx}" y="${ly}" text-anchor="middle" font-family="Roboto" font-size="6.8" fill="#666">${label.map((line, index) => `<tspan x="${lx}" dy="${index ? 8 : 0}">${xml(line)}</tspan>`).join('')}</text>`;
  });
  const points = values.map((value, i) => point(i, 72 * Math.max(0, value) / max));
  body += `<polygon points="${points.map(p => p.join(',')).join(' ')}" fill="#d200ff" fill-opacity=".2" stroke="#d200ff" stroke-width="1.3"/>`;
  body += points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#00b400"/>`).join('');
  return svg(250, 210, body);
}

export interface RecipePdfAssets { savApp: string; adepro: string; }

export function creerDocumentRecette(recette: Recette, assets: RecipePdfAssets): TDocumentDefinitions {
  const items = compositionRecette(recette.ligneIngredients, recette.apportEnEau, recette.qteAlcalin, recette.avecSoude);
  const total = items.reduce((sum, item) => sum + item.quantite, 0);
  const heading = (text: string): Content => ({ text, id: text === 'Profil & scores :' ? 'profil' : undefined, color: purple, bold: true, decoration: 'underline', fontSize: 12, margin: [0, 22, 0, 12] });
  const rows: TableCell[][] = items.map((item, i) => {
    const isWater = i === recette.ligneIngredients.length;
    const isAlkali = i === recette.ligneIngredients.length + 1;
    const color = isWater ? '#006b91' : isAlkali ? '#d95319' : recette.ligneIngredients[i].ingredient.estCorpsGras ? '#18702a' : purple;
    return [{ text: isAlkali ? `ALCALIN : ${item.name}` : item.name, color }, { text: `${number(item.quantite)} g`, alignment: 'center', color }];
  });
  const legend: Content = {
    table: { widths: [7, '*', 32], body: items.map(item => [
      { canvas: [{ type: 'ellipse', x: 3, y: 5, r1: 3, r2: 3, color: item.color }] },
      { text: item.name, fontSize: 7.5 }, { text: `${item.percent} %`, alignment: 'right', fontSize: 7.5, color: '#666' },
    ]) }, layout: 'noBorders',
  };
  const scores: Content = recette.resultats.length ? {
    table: { widths: [90, 98, 25], body: recette.resultats.map(r => [
      { text: r.caracteristique.nom, bold: true, fontSize: 7.5, margin: [0, 5, 0, 0] },
      { svg: jaugePdf(r), width: 98 },
      { svg: svg(27, 17, `<rect x="0" y="3" width="27" height="12" rx="3" fill="#212529"/><text x="13.5" y="12" font-family="Roboto" font-size="7.5" font-weight="bold" text-anchor="middle" fill="white">${xml(number(r.score))}</text>`), width: 25 },
    ]) }, layout: { hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 1, paddingBottom: () => 1 },
  } : { text: 'Aucun score disponible.', color: '#666' };
  const columns = (left: Content, right: Content, height = 165): Content => ({
    columns: [
      { stack: [left], width: 233 },
      { width: 0, canvas: [{ type: 'line', x1: 0, y1: 0, x2: 0, y2: height, lineWidth: .6, lineColor: purple }] },
      { stack: [right], width: 244 },
    ], columnGap: 14,
  });
  return {
    pageSize: 'A4', pageOrientation: 'portrait', pageMargins: [45, 32, 45, 40],
    // Leave enough room for the heading and the 205-point profile on the same page.
    pageBreakBefore: node => node.id === 'profil' && node.startPosition.top > 550,
    info: { title: `Fiche recette savon - ${recette.titre}`, author: 'SavApp', subject: 'Composition et profil de la recette' },
    defaultStyle: { font: 'Roboto', fontSize: 10, color: '#222' },
    background: (_page, size) => ({ canvas: [{ type: 'rect', x: 22, y: 14, w: size.width - 44, h: size.height - 40, r: 18, lineWidth: .8, lineColor: green }] }),
    footer: (page, count) => count > 1 ? { text: `${page} / ${count}`, alignment: 'center', fontSize: 8, color: '#666', margin: [0, 5, 0, 0] } : { text: '' },
    content: [
      { columns: [{ image: assets.savApp, fit: [165, 65] }, { image: assets.adepro, fit: [165, 65], alignment: 'right' }], margin: [10, 0, 0, 35] },
      { text: 'Fiche recette savon', font: 'JustAnotherHand', fontSize: 27, color: purple, alignment: 'center', margin: [0, 0, 0, 8] },
      { text: recette.titre, color: green, bold: true, fontSize: 21, alignment: 'center', margin: [0, 0, 0, 5] },
      { text: `Surgraissage de ${number(recette.surgraissage)} %`, color: purple, bold: true, fontSize: 17, alignment: 'center', margin: [0, 0, 0, 5] },
      heading('Description :'),
      { table: { widths: ['*'], body: [[{ text: recette.description || 'Aucune description.', italics: true, margin: [5, 3, 0, 3] }]] },
        layout: { hLineWidth: () => 0, vLineWidth: i => i === 0 ? .7 : 0, vLineColor: () => purple } },
      heading('Composition :'),
      columns({
        table: { headerRows: 1, widths: ['*', 76], body: [
          [{ text: 'Ingrédient', bold: true, alignment: 'center' }, { text: 'Quantité', bold: true, alignment: 'center' }],
          ...rows, [{ text: 'TOTAL', bold: true, alignment: 'center' }, { text: `${number(total)} g`, bold: true, alignment: 'center' }],
        ] },
        layout: { hLineWidth: () => .5, vLineWidth: () => .5, hLineColor: () => green, vLineColor: () => green,
          fillColor: i => i === 0 || i === rows.length + 1 ? green : i % 2 === 0 ? '#ddd' : null,
          paddingTop: () => 1.5, paddingBottom: () => 1.5 },
      }, { columns: [{ ...legend, width: 137 }, { svg: donutPdf(items), width: 103, margin: [4, 25, 0, 0] }] }),
      { stack: [heading('Profil & scores :'), columns(scores, { svg: radarPdf(recette.resultats), width: 244 }, 205)] },
    ],
  };
}
