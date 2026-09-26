import { environment } from '../../../environments/environment';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { NgForm } from '@angular/forms';
import { PasswordRecoveryPage } from './password-recovery-page';
import { authInterceptor } from '../../interceptors/auth-interceptor';

describe('PasswordRecoveryPage', () => {
    function setup(reset = false, key = 'test-key') {
        TestBed.configureTestingModule({
            imports: [PasswordRecoveryPage],
            providers: [provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(),
                { provide: ActivatedRoute, useValue: { snapshot: {
                    data: { reset }, queryParamMap: convertToParamMap({ key }),
                } } },
            ],
        });
        const fixture = TestBed.createComponent(PasswordRecoveryPage);
        fixture.detectChanges();
        const page = fixture.componentInstance;
        page.email = page.confirmationEmail = 'test@example.com';
        page.password = page.confirmationPassword = 'new-password';
        page.code = '123456';
        return { fixture, page, http: TestBed.inject(HttpTestingController) };
    }
    const form = { invalid: false } as NgForm;
    afterEach(() => TestBed.inject(HttpTestingController).verify());

    it('accepte une réponse vide et remplace le formulaire par une invitation conditionnelle', () => {
        const { page, fixture, http } = setup();
        page.envoyer(form);
        page.envoyer(form);
        const req = http.expectOne(`${environment.apiUrl}/auth/mdp-oublie`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ email: 'test@example.com' });
        expect(req.request.headers.has('Authorization')).toBeFalse();
        req.flush(null);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('form')).toBeNull();
        expect(fixture.nativeElement.textContent).toContain('Si cette adresse correspond');
    });
    it('refuse des emails différents', () => {
        const { page, http } = setup();
        page.confirmationEmail = 'other@example.com';
        page.envoyer(form);
        http.expectNone(`${environment.apiUrl}/auth/mdp-oublie`);
    });
    it('transmet le jeton et le code numérique puis propose la connexion', () => {
        const { page, fixture, http } = setup(true);
        page.envoyer(form);
        const req = http.expectOne(`${environment.apiUrl}/auth/mdp-reset?key=test-key`);
        expect(req.request.body).toEqual({ nouveauMotDePasse: 'new-password', nouveauMotDePasseConfirmation: 'new-password', code: 123456 });
        req.flush({ result: 'ok' });
        fixture.detectChanges();
        expect(page.termine).toBeTrue();
        expect(page.password).toBe('');
        expect(fixture.nativeElement.querySelector('a.btn').getAttribute('href')).toBe('/login');
    });
    it('affiche les erreurs métier retournées avec HTTP 200', () => {
        const { page, http } = setup(true);
        page.envoyer(form);
        http.expectOne(`${environment.apiUrl}/auth/mdp-reset?key=test-key`).flush({ errors: ['expiration du code'] });
        expect(page.termine).toBeFalse();
        expect(page.erreur).toContain('expiré');
        expect(page.enCours).toBeFalse();
    });
    it('refuse un lien sans jeton', () => {
        const { page, fixture, http } = setup(true, '');
        page.envoyer(form);
        expect(fixture.nativeElement.textContent).toContain('lien est incomplet');
        http.expectNone(req => req.url.includes('mdp-reset'));
    });
    it('refuse les mots de passe différents et les codes incomplets', () => {
        const { page, http } = setup(true);
        page.confirmationPassword = 'different';
        page.envoyer(form);
        page.confirmationPassword = page.password;
        page.code = '123';
        page.envoyer(form);
        http.expectNone(req => req.url.includes('mdp-reset'));
    });
    it('permet de réessayer après une erreur réseau', () => {
        const { page, http } = setup();
        page.envoyer(form);
        http.expectOne(`${environment.apiUrl}/auth/mdp-oublie`).error(new ProgressEvent('error'));
        expect(page.enCours).toBeFalse();
        expect(page.termine).toBeFalse();
        expect(page.erreur).toContain('réessayer');
    });
});
