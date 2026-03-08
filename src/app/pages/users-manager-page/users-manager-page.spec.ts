import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersManagerPage } from './users-manager-page';

describe('UsersManagerPage', () => {
  let component: UsersManagerPage;
  let fixture: ComponentFixture<UsersManagerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersManagerPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersManagerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
