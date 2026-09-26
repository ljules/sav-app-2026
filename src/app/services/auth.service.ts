import { environment } from '../../environments/environment';
import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, defer, finalize, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';
import { AUTH_REFRESH_MARGIN_SECONDS } from '../auth.config';

export const PUBLIC_REGISTRATION_REQUEST = new HttpContextToken(() => false);

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly apiUrl = environment.apiUrl;
    private readonly API_URL = `${this.apiUrl}/auth`;
    private readonly TOKEN_KEY = "savapp_jwt_token";
    private readonly REFRESH_TOKEN_KEY = 'savapp_refresh_token';
    private readonly refreshMarginSeconds = inject(AUTH_REFRESH_MARGIN_SECONDS);
    private refreshInFlight$: Observable<string> | null = null;
    private sessionVersion = 0;
    private router = inject(Router); 

    constructor(private http: HttpClient) { }

    login(credential: { identifier: string; password: string }): Observable<{ token: string; refreshToken: string }> {
        return defer(() => {
            this.clearTokens();
            const version = this.sessionVersion;
            return this.http.post<{ token: string; refreshToken: string }>(`${this.API_URL}/login`, credential).pipe(
                tap(response => {
                    if (version !== this.sessionVersion) throw new Error('Session remplacée.');
                    this.storeTokens(response.token, response.refreshToken);
                })
            );
        });
    }

    private storeTokens(accessToken: string, refreshToken: string): void {
        if (!accessToken || !refreshToken || typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
            throw new Error('Réponse de tokens incomplète.');
        }
        // Écritures synchrones avant de libérer les requêtes en attente.
        try {
            localStorage.setItem(this.TOKEN_KEY, accessToken);
            localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        } catch (error) {
            this.logout();
            throw error;
        }
    }

    private clearTokens(): void {
        this.sessionVersion++;
        this.refreshInFlight$ = null;
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
    logout(message?: string): void {
        this.clearTokens();
        if (message) {
            sessionStorage.setItem('savapp_auth_message', message);
        }
        this.router.navigate(['/login']); // AJOUTER LE REDIRECTION
    }

    consumeAuthMessage(): string | null {
        const message = sessionStorage.getItem('savapp_auth_message');
        sessionStorage.removeItem('savapp_auth_message');
        return message;
    }
    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }
    getValidAccessToken(): Observable<string | null> {
        return defer(() => {
            if (this.refreshInFlight$) return this.refreshInFlight$;
            const token = this.getToken();
            if (!token) return of(null);
            const exp = this.getDecodedToken()?.exp;
            if (typeof exp === 'number' && Number.isFinite(exp) &&
                exp * 1000 > Date.now() + this.refreshMarginSeconds * 1000) return of(token);
            return this.refreshAccessToken();
        });
    }

    private refreshAccessToken(): Observable<string> {
        const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
        if (!refreshToken) {
            this.logout();
            return throwError(() => new Error('Refresh token absent.'));
        }
        const version = this.sessionVersion;
        const refresh$: Observable<string> = this.http.post<{ accessToken: string; refreshToken: string }>(
            `${this.API_URL}/refresh`, { refreshToken }
        ).pipe(
            map(response => {
                // Une réponse tardive ne doit pas annuler un logout ou un nouveau login.
                if (version !== this.sessionVersion) throw new Error('Session remplacée.');
                this.storeTokens(response.accessToken, response.refreshToken);
                return response.accessToken;
            }),
            catchError(error => {
                if (version === this.sessionVersion) this.logout();
                return throwError(() => error);
            }),
            finalize(() => {
                if (this.refreshInFlight$ === refresh$) this.refreshInFlight$ = null;
            }),
            // Terminer la rotation même si une requête en attente est annulée.
            shareReplay({ bufferSize: 1, refCount: false })
        );
        this.refreshInFlight$ = refresh$;
        return refresh$;
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    private getDecodedToken(): any {
        const token = this.getToken();
        if (!token) return null;
        try {
            const payload = token.split('.')[1];
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
            return JSON.parse(new TextDecoder().decode(bytes));
        } catch (e) {
            return null;
        }
    }
 
    getUserIdentifier(): string {
        const decoded = this.getDecodedToken();
        return decoded ? decoded.sub : 'Invité';
    }

    hasRole(role: string): boolean {
        const decoded = this.getDecodedToken();
        if (!decoded || decoded.role) return false;
        return decoded.roles.includes(role);
    }

    getUserFullInfo() {
        const decoded = this.getDecodedToken();
        if (!decoded) return null;
        return {
            username: decoded.sub,
            roles: decoded.role || [],
            expiration: new Date(decoded.exp * 1000)
        };
    }

    subscribe(userInfo: {username: string, email: string, password: string }): Observable<{message?: string; error?: string}> {
        return this.http.post<{message?: string; error?: string}>(`${this.API_URL}/register`, userInfo, {
            context: new HttpContext().set(PUBLIC_REGISTRATION_REQUEST, true),
        });
    }

    confirmInscription(key: string): Observable<{result: string}> {
        return this.http.get<{result: string}>(`${this.API_URL}/confirm-inscription`, {
            params: { key },
            context: new HttpContext().set(PUBLIC_REGISTRATION_REQUEST, true),
        });
    }

    demanderResetMotDePasse(email: string): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/mdp-oublie`, { email }, {
            context: new HttpContext().set(PUBLIC_REGISTRATION_REQUEST, true),
        });
    }

    resetMotDePasse(key: string, body: {
        nouveauMotDePasse: string;
        nouveauMotDePasseConfirmation: string;
        code: number;
    }): Observable<{result?: string; errors?: string[]}> {
        return this.http.post<{result?: string; errors?: string[]}>(`${this.API_URL}/mdp-reset`, body, {
            params: { key },
            context: new HttpContext().set(PUBLIC_REGISTRATION_REQUEST, true),
        });
    }
}   


