import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeCalculatorPage } from './recipe-calculator-page';

describe('RecipeCalculatorPage', () => {
  let component: RecipeCalculatorPage;
  let fixture: ComponentFixture<RecipeCalculatorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeCalculatorPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeCalculatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
