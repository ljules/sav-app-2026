import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [

    // Accès & redirection vers la page home :
    { path: '', pathMatch: 'full', redirectTo: 'home' }, // Route de la racine :
    { path: 'home', component: HomePage },

    // Pages d'authentification :
    { path: 'login', loadComponent: () => import('./pages/login-page/login-page').then(m => m.LoginPage) },
    { path: 'subscribe', loadComponent: () => import('./pages/subscribe-page/subscribe-page').then(m => m.SubscribePage)},
    { path: 'confirm-inscription', loadComponent: () => import('./pages/confirm-inscription-page/confirm-inscription-page').then(m => m.ConfirmInscriptionPage) },
    { path: 'mdp-oublie', loadComponent: () => import('./pages/password-recovery-page/password-recovery-page').then(m => m.PasswordRecoveryPage) },
    { path: 'reset-mdp', loadComponent: () => import('./pages/password-recovery-page/password-recovery-page').then(m => m.PasswordRecoveryPage), data: { reset: true } },

    // Compte utilisateur :
    { path: 'account',loadComponent: () => import('./pages/account-manager-page/account-manager-page').then(m => m.AccountManagerPage), canActivate: [authGuard] },

    // Recettes :
    { path: 'recipe-calculator', loadComponent: () => import('./pages/recipe-calculator-page/recipe-calculator-page').then(m => m.RecipeCalculatorPage) },
    { path: 'recipe-calculator/:id', loadComponent: () => import('./pages/recipe-calculator-page/recipe-calculator-page').then(m => m.RecipeCalculatorPage), canActivate: [authGuard] },
    { path: 'recipe-manager', loadComponent: () => import('./pages/recipe-manager-page/recipe-manager-page').then(m => m.RecipeManagerPage), canActivate: [authGuard]},

    // Administration - Gestion :
    { path: 'users-manager', loadComponent: () => import('./pages/users-manager-page/users-manager-page').then(m => m.UsersManagerPage), canActivate: [authGuard] },
    { path: 'ingredients-manager', loadComponent: () => import('./pages/ingredients-manager-page/ingredients-manager-page').then(m => m.IngredientsManagerPage), canActivate: [authGuard]},

    // A propos :
    { path: "about", loadComponent: () => import('./pages/about-page/about-page').then(m => m.AboutPage) },

    // Mentions légales :
    {path: "legal-notice", loadComponent: () => import('./pages/legal-notice-page/legal-notice-page').then(m => m.LegalNoticePage)},
    
    // Redirection par défaut vers home (en cas d'url invalide) :
    {path: '**', redirectTo: 'home'}    // Toujours mis en dernier !
];
