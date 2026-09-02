import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    const authService = jasmine.createSpyObj<AuthService>(
      'AuthService', ['getUserIdentifier', 'isAuthenticated', 'getUserFullInfo', 'logout']);
    authService.getUserIdentifier.and.returnValue('');
    authService.isAuthenticated.and.returnValue(false);
    authService.getUserFullInfo.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('laisse défiler le bandeau et rend uniquement la navigation sticky', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.app-header')?.classList.contains('fixed-top')).toBeFalse();
    expect(element.querySelector('app-navbar')?.classList.contains('sticky-top')).toBeTrue();
  });
});
