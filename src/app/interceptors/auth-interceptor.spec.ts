import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { authInterceptor } from './auth-interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

const jwt = (exp: number) => {
    const bytes = new TextEncoder().encode(JSON.stringify({ exp, sub: 'élève', role: 'ROLE_ADMIN' }));
    const payload = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `header.${payload}.signature`;
};

describe('authInterceptor avec rotation JWT', () => {
    let http: HttpClient;
    let backend: HttpTestingController;
    let auth: AuthService;
    let navigate: jasmine.Spy;
    let now: number;
    const api = `${environment.apiUrl}/api-savon/v1/recette`;
    const refresh = `${environment.apiUrl}/auth/refresh`;

    beforeEach(() => {
        localStorage.removeItem('savapp_jwt_token');
        localStorage.removeItem('savapp_refresh_token');
        TestBed.configureTestingModule({ providers: [provideRouter([]),
            provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()] });
        http = TestBed.inject(HttpClient);
        backend = TestBed.inject(HttpTestingController);
        auth = TestBed.inject(AuthService);
        navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
        now = 1800000000000;
        spyOn(Date, 'now').and.callFake(() => now);
    });
    afterEach(() => {
        backend.verify();
        localStorage.removeItem('savapp_jwt_token');
        localStorage.removeItem('savapp_refresh_token');
        sessionStorage.removeItem('savapp_auth_message');
    });
    function login(seconds = 60) {
        const token = jwt(now / 1000 + seconds);
        auth.login({ identifier: 'test', password: 'secret' }).subscribe();
        const req = backend.expectOne(`${environment.apiUrl}/auth/login`);
        expect(req.request.method).toBe('POST');
        expect(req.request.headers.has('Authorization')).toBeFalse();
        req.flush({ token, refreshToken: 'R1' });
        return token;
    }
    function finishRequest(token: string, url = api) {
        const req = backend.expectOne(url);
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
        req.flush([]);
    }
    function finishRefresh(oldRefresh: string, nextRefresh: string) {
        const req = backend.expectOne(refresh);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ refreshToken: oldRefresh });
        expect(req.request.headers.has('Authorization')).toBeFalse();
        const token = jwt(now / 1000 + 60);
        req.flush({ accessToken: token, refreshToken: nextRefresh });
        expect(auth.getToken()).toBe(token);
        expect(localStorage.getItem('savapp_refresh_token')).toBe(nextRefresh);
        return token;
    }

    it('1 : conserve le couple du login et envoie un JWT valide sans refresh', () => {
        const token = login();
        expect(auth.isAuthenticated()).toBeTrue();
        expect(auth.getUserIdentifier()).toBe('élève');
        expect(auth.getUserFullInfo()?.roles).toBe('ROLE_ADMIN');
        expect(localStorage.getItem('savapp_refresh_token')).toBe('R1');
        http.get(api).subscribe();
        finishRequest(token);
        backend.expectNone(refresh);
    });
    for (const seconds of [5, 4, 0, -1]) {
        it(`2 : renouvelle avant la requête avec exp à ${seconds} secondes`, () => {
            login(seconds);
            http.get(api).subscribe();
            backend.expectNone(api);
            finishRequest(finishRefresh('R1', 'R2'));
        });
    }
    it('3 : utilise R2 lors de la rotation suivante', () => {
        login(1);
        http.get(api).subscribe();
        finishRequest(finishRefresh('R1', 'R2'));
        now += 60000;
        http.get(api).subscribe();
        finishRequest(finishRefresh('R2', 'R3'));
    });
    it('4 : partage un seul refresh entre trois requêtes simultanées', () => {
        login(1);
        const urls = ['recette', 'utilisateur', 'ingredient'].map(p => `${environment.apiUrl}/api-savon/v1/${p}`);
        urls.forEach(url => http.get(url).subscribe());
        urls.forEach(url => backend.expectNone(url));
        const token = finishRefresh('R1', 'R2');
        urls.forEach(url => finishRequest(token, url));
        backend.expectNone(refresh);
    });
    for (const status of [401, 403, 500, 0]) {
        it(`5 : termine la session pour un échec refresh ${status}`, () => {
            login(1);
            let errors = 0;
            for (let i = 0; i < 3; i++) http.get(api).subscribe({ error: () => errors++ });
            const req = backend.expectOne(refresh);
            if (status === 0) req.error(new ProgressEvent('error'));
            else req.flush(null, { status, statusText: 'Failure' });
            expect(errors).toBe(3);
            expect(auth.getToken()).toBeNull();
            expect(localStorage.getItem('savapp_refresh_token')).toBeNull();
            expect(auth.isAuthenticated()).toBeFalse();
            expect(navigate).toHaveBeenCalledOnceWith(['/login']);
            backend.expectNone(api);
            backend.expectNone(refresh);
        });
    }
    it('5 : déconnecte si le refresh token est absent', () => {
        login(1);
        localStorage.removeItem('savapp_refresh_token');
        http.get(api).subscribe({ error: () => {} });
        expect(auth.isAuthenticated()).toBeFalse();
        expect(navigate).toHaveBeenCalledOnceWith(['/login']);
        backend.expectNone(refresh);
        backend.expectNone(api);
    });
    it('6 : transmet un 403 sans refresh ni déconnexion avec un JWT valide', () => {
        login();
        http.get(api).subscribe({ error: e => expect(e.status).toBe(403) });
        backend.expectOne(api).flush(null, { status: 403, statusText: 'Forbidden' });
        backend.expectNone(refresh);
        expect(auth.isAuthenticated()).toBeTrue();
        expect(navigate).not.toHaveBeenCalled();
    });
    it('7 : logout supprime les deux tokens et conserve le message et la redirection', () => {
        login();
        auth.logout('Session terminée');
        expect(auth.getToken()).toBeNull();
        expect(localStorage.getItem('savapp_refresh_token')).toBeNull();
        expect(auth.isAuthenticated()).toBeFalse();
        expect(auth.consumeAuthMessage()).toBe('Session terminée');
        expect(navigate).toHaveBeenCalledOnceWith(['/login']);
    });
    it('ne restaure pas la session avec une réponse de refresh après logout', () => {
        login(1);
        http.get(api).subscribe({ error: () => {} });
        const req = backend.expectOne(refresh);
        auth.logout();
        req.flush({ accessToken: jwt(now / 1000 + 60), refreshToken: 'R2' });
        expect(auth.isAuthenticated()).toBeFalse();
        expect(localStorage.getItem('savapp_refresh_token')).toBeNull();
        backend.expectNone(api);
        expect(navigate).toHaveBeenCalledTimes(1);
    });
    it('préserve un nouveau login lorsqu’un ancien refresh échoue', () => {
        login(1);
        http.get(api).subscribe({ error: () => {} });
        const oldRefresh = backend.expectOne(refresh);
        const token = login();
        oldRefresh.flush(null, { status: 403, statusText: 'Forbidden' });
        expect(auth.getToken()).toBe(token);
        expect(navigate).not.toHaveBeenCalled();
        backend.expectNone(api);
    });
    it('exclut les opérations publiques et les URL externes même avec un JWT expiré', () => {
        login(-1);
        auth.demanderResetMotDePasse('test@example.fr').subscribe();
        const publicReq = backend.expectOne(`${environment.apiUrl}/auth/mdp-oublie`);
        expect(publicReq.request.headers.has('Authorization')).toBeFalse();
        publicReq.flush(null);
        http.get('https://example.org/api-savon/v1/recette').subscribe();
        const external = backend.expectOne('https://example.org/api-savon/v1/recette');
        expect(external.request.headers.has('Authorization')).toBeFalse();
        external.flush([]);
        backend.expectNone(refresh);
    });
    it('laisse les visiteurs accéder aux endpoints publics sans token', () => {
        http.get(api).subscribe();
        const req = backend.expectOne(api);
        expect(req.request.headers.has('Authorization')).toBeFalse();
        req.flush([]);
        backend.expectNone(refresh);
    });
    it('rejette une réponse de rotation incomplète', () => {
        login(1);
        http.get(api).subscribe({ error: () => {} });
        backend.expectOne(refresh).flush({ accessToken: jwt(now / 1000 + 60) });
        expect(auth.isAuthenticated()).toBeFalse();
        expect(localStorage.getItem('savapp_refresh_token')).toBeNull();
        backend.expectNone(api);
    });
    for (const invalid of ['illisible', 'header.e30.signature']) {
        it(`renouvelle un JWT illisible ou sans exp : ${invalid}`, () => {
            login();
            localStorage.setItem('savapp_jwt_token', invalid);
            http.get(api).subscribe();
            finishRequest(finishRefresh('R1', 'R2'));
        });
    }
    it('conserve la déconnexion sur un 401 de l’API', () => {
        login();
        http.get(api).subscribe({ error: () => {} });
        backend.expectOne(api).flush(null, { status: 401, statusText: 'Unauthorized' });
        expect(auth.isAuthenticated()).toBeFalse();
        expect(localStorage.getItem('savapp_refresh_token')).toBeNull();
        expect(navigate).toHaveBeenCalledOnceWith(['/login']);
        backend.expectNone(refresh);
    });
    it('termine la rotation si la requête initiale est annulée', () => {
        login(1);
        const subscription = http.get(api).subscribe();
        const req = backend.expectOne(refresh);
        subscription.unsubscribe();
        expect(req.cancelled).toBeFalse();
        const token = jwt(now / 1000 + 60);
        req.flush({ accessToken: token, refreshToken: 'R2' });
        http.get(api).subscribe();
        finishRequest(token);
        backend.expectNone(refresh);
    });
});
