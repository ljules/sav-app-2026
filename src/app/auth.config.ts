import { InjectionToken } from '@angular/core';

// Compatible avec les JWT de développement valables une minute.
export const AUTH_REFRESH_MARGIN_SECONDS = new InjectionToken<number>('AUTH_REFRESH_MARGIN_SECONDS', {
    providedIn: 'root',
    factory: () => 5,
});
