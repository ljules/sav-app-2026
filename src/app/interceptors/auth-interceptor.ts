import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService, PUBLIC_REGISTRATION_REQUEST } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // L'inscription et l'activation sont publiques, même avec une ancienne session locale.
    if (req.context.get(PUBLIC_REGISTRATION_REQUEST)) return next(req);
    const authService = inject(AuthService);
    const token = authService.getToken();

    let authReq = req;
    
    // Clonnage de la requête pour lui ajouter le token JWT :
    if (token) {
        authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}`}
        });        
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status == 401) {
                authService.logout();
            }
            return throwError(() => error);
        })
    )
};
