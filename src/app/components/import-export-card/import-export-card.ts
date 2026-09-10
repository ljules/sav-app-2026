import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-import-export-card',
  template: `
    <div class="card shadow mb-3">
      <div class="card-header text-light"><i class="bi bi-database-fill-gear"></i> Import / Export {{ sujet }}</div>
      <div class="card-body text-light">
        <div class="row g-4 align-items-end">
          <div class="col-lg-6 exchange-zone">
            <h6><i class="bi bi-database-fill-up"></i> Import {{ format }}</h6>
            <input type="file" class="form-control form-control-sm" [accept]="accept"
              [attr.aria-label]="'Fichier ' + format + ' à importer'" [disabled]="busy" (change)="fileSelected.emit($event)">
            <button type="button" class="btn btn-sm btn-warning fw-bold text-black mt-2"
              (click)="importRequested.emit()" [disabled]="!hasFile || busy">
              <i class="bi bi-upload"></i> {{ busy ? 'Import en cours...' : 'Importer ' + format }}
            </button>
          </div>
          <div class="col-lg-6 exchange-zone">
            <h6><i class="bi bi-database-fill-down"></i> Export {{ format }}</h6>
            <p class="small mb-2">{{ description }}</p>
            <button type="button" class="btn btn-sm btn-success fw-bold" (click)="exportRequested.emit()"
              [disabled]="!canExport || busy"><i class="bi bi-download"></i> Exporter {{ format }}</button>
          </div>
        </div>
        @if (message) { <div class="alert alert-success mt-3 mb-0" role="status">{{ message }}</div> }
        @if (error) { <div class="alert alert-danger mt-3 mb-0" role="alert">{{ error }}</div> }
        <ng-content />
      </div>
    </div>`,
  styles: [`
    .card { background-color: var(--brown-charter); border-color: var(--green-charter); }
    .card-header { font-weight: bold; background-color: var(--green-charter); }
    .exchange-zone + .exchange-zone { border-left: 1px solid rgba(255,255,255,.25); }
    @media(max-width: 991px) { .exchange-zone + .exchange-zone { border-left: 0; } }
  `],
})
export class ImportExportCard {
  @Input() sujet = '';
  @Input() format = 'JSON';
  @Input() accept = '.json';
  @Input() description = '';
  @Input() busy = false;
  @Input() hasFile = false;
  @Input() canExport = true;
  @Input() message = '';
  @Input() error = '';
  @Output() fileSelected = new EventEmitter<Event>();
  @Output() importRequested = new EventEmitter<void>();
  @Output() exportRequested = new EventEmitter<void>();
}
