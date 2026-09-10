import { of } from 'rxjs';
import { IngredientService } from '../../services/ingredient.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientsManagerPage } from './ingredients-manager-page';

describe('IngredientsManagerPage', () => {
  let component: IngredientsManagerPage;
  let fixture: ComponentFixture<IngredientsManagerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientsManagerPage],
      providers: [{ provide: IngredientService, useValue: { getIngredients: () => of([]) } }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngredientsManagerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
