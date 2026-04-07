import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { LoginPage } from './pages/login-page/login-page';
import { SubscribePage } from './pages/subscribe-page/subscribe-page';
import { AccountManagerPage } from './pages/account-manager-page/account-manager-page';
import { RecipeCalculatorPage } from './pages/recipe-calculator-page/recipe-calculator-page';
import { RecipeManagerPage } from './pages/recipe-manager-page/recipe-manager-page';
import { UsersManagerPage } from './pages/users-manager-page/users-manager-page';
import { IngredientsManagerPage } from './pages/ingredients-manager-page/ingredients-manager-page';
import { AboutPage } from './pages/about-page/about-page';
import { LegalNoticePage } from './pages/legal-notice-page/legal-notice-page';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [

    // Accès & redirection vers la page home :
    { path: '', pathMatch: 'full', redirectTo: 'home' }, // Route de la racine :
    { path: 'home', component: HomePage },

    // Pages d'authentification :
    { path: 'login', component: LoginPage },
    { path: 'subscribe', component: SubscribePage},

    // Compte utilisateur :
    { path: 'account',component: AccountManagerPage, canActivate: [authGuard] },

    // Recettes :
    { path: 'recipe-calculator', component: RecipeCalculatorPage },
    { path: 'recipe-manager', component: RecipeManagerPage, canActivate: [authGuard]},

    // Administration - Gestion :
    { path: 'users-manager', component: UsersManagerPage, canActivate: [authGuard] },
    { path: 'ingredients-manager', component: IngredientsManagerPage, canActivate: [authGuard]},

    // A propos :
    { path: "about", component: AboutPage },

    // Mentions légales :
    {path: "legal-notice", component: LegalNoticePage},
    
    // Redirection par défaut vers home (en cas d'url invalide) :
    {path: '**', redirectTo: 'home'}    // Toujours mis en dernier !
];
