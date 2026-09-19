import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscribePage } from './subscribe-page';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('SubscribePage', () => {
  let component: SubscribePage;
  let fixture: ComponentFixture<SubscribePage>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['subscribe']);
    await TestBed.configureTestingModule({
      imports: [SubscribePage],
      providers: [{ provide: AuthService, useValue: auth }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscribePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.userInfo = { username: 'test', email: 'test@example.com', password: 'secret' };
    component.doubleInputPwd = 'secret';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('affiche l’invitation uniquement après le message de succès attendu', () => {
    auth.subscribe.and.returnValue(of({ message: 'Inscription réussie. Un email de confirmation vous a été envoyé.' }));
    component.onSubmit();
    fixture.detectChanges();
    expect(component.inscriptionEnvoyee).toBeTrue();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Consultez vos emails');
  });

  it('conserve le formulaire et explique un email déjà utilisé malgré HTTP 200', () => {
    auth.subscribe.and.returnValue(of({ error: 'Email déjà utilisé' }));
    component.onSubmit();
    fixture.detectChanges();
    expect(component.inscriptionEnvoyee).toBeFalse();
    expect(component.envoiEnCours).toBeFalse();
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
    expect(component.errorMessage).toContain('adresse email est déjà utilisée');
    expect(component.userInfo.email).toBe('test@example.com');
  });

  for (const response of [null, {}, { message: 'Autre réponse' }, { error: 'Nom déjà utilisé' }]) {
    it(`ne considère pas ${JSON.stringify(response)} comme un succès`, () => {
      auth.subscribe.and.returnValue(of(response as any));
      component.onSubmit();
      expect(component.inscriptionEnvoyee).toBeFalse();
      expect(component.errorMessage).toBeTruthy();
    });
  }

  it('affiche aussi l’erreur métier reçue avec un statut HTTP en échec', () => {
    auth.subscribe.and.returnValue(throwError(() => ({ error: { error: 'Email déjà utilisé' } })));
    component.onSubmit();
    expect(component.errorMessage).toContain('adresse email est déjà utilisée');
    expect(component.envoiEnCours).toBeFalse();
  });
});
