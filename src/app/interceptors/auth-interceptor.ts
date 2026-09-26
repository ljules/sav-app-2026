import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService, PUBLIC_REGISTRATION_REQUEST } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const backend = new URL(environment.apiUrl || '/', window.location.origin);
    const target = new URL(req.url, window.location.origin);
    const isBackend = target.origin === backend.origin &&
        (target.pathname.startsWith('/api-savon/') || target.pathname.startsWith('/auth/'));

    if (!isBackend || req.context.get(PUBLIC_REGISTRATION_REQUEST) ||
        /^\/auth\/(login|refresh)\/?$/.test(target.pathname)) return next(req);

    const authService = inject(AuthService);
    return authService.getValidAccessToken().pipe(
        switchMap(token => next(token ? req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
        }) : req).pipe(
            catchError((error: HttpErrorResponse) => {
                // Ne pas déconnecter une session plus récente sur une réponse tardive.
                if (error.status === 401 && token === authService.getToken()) authService.logout();
                return throwError(() => error);
            })
        ))
    );
};
