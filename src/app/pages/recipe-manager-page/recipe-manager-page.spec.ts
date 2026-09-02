import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { RecetteService } from '../../services/recette.service';
import { RecipeManagerPage } from './recipe-manager-page';

describe('RecipeManagerPage', () => {
  let component: RecipeManagerPage;
  let fixture: ComponentFixture<RecipeManagerPage>;

  beforeEach(async () => {
    const recetteService = jasmine.createSpyObj<RecetteService>('RecetteService', ['getRecettes']);
    recetteService.getRecettes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [RecipeManagerPage],
      providers: [{ provide: RecetteService, useValue: recetteService }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeManagerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
