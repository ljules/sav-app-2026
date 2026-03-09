
# <h1 style="text-align: center; font-weight:bold ">TP SavApp : Consommation de l'API - Le Service Ingrédients</h1>

<br>

>**Objectif :** Créer un service Angular capable de récupérer la liste des corps gras depuis l'API REST et de les mettre à disposition des composants.

<br>


## <u>**1. Qu'est-ce qu'un Service dans Angular ?**</u>

Un **Service** est une classe dont le rôle est de centraliser la **logique métier** et les appels de données. 
* **Centralisation :** Si plusieurs composants ont besoin de la liste des huiles, ils appellent tous le même service.
* **Pérennité :** Les données récupérées peuvent être partagées et conservées même si l'utilisateur change de page.
* **Modularité :** Le composant s'occupe de l'affichage (**IHM**), le service s'occupe de la communication (**API**).



## 2. Configuration préalable : HttpClient

Pour que nos services puissent effectuer des requêtes **HTTP** (***GET***, ***POST***...), nous devons activer le module **`HttpClient`** dans la configuration globale de l'application.

**Fichier : `src/app/app.config.ts`**
Assurez-vous d'ajouter `provideHttpClient()` dans le tableau des providers :

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // <--- Import à ajouter
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient() // <--- Activation du client HTTP
  ]
};
```

<div style="page-break-after: always;"></div>


## 3. Création du IngredientService

Générez le service via la console : 
`ng generate service services/ingredient` (ou `ng g s services/ingredient`)

**Fichier : `src/app/services/ingredient.service.ts`**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ingredient } from '../models/ingredient.model';

@Injectable({
  providedIn: 'root' // Le service est disponible dans toute l'application
})
export class IngredientService {

  // URL de base de notre API (à ajuster selon votre environnement)
  private readonly API_URL = 'http://localhost:8080/api-savon/v1/ingredient';

  constructor(private http: HttpClient) { }

  /**
   * Récupère la liste de tous les ingrédients depuis le backend.
   * @returns Un Observable contenant le tableau des ingrédients.
   */
  getIngredients(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(this.API_URL);
  }

  /**
   * Récupère un ingrédient spécifique par son identifiant.
   * @param id L'identifiant de l'ingrédient
   */
  getIngredientById(id: number): Observable<Ingredient> {
    return this.http.get<Ingredient>(`${this.API_URL}/${id}`);
  }
}
```

---

## 4. Concepts clés pour les développeurs

### L'Observable (Le flux de données)
La méthode `getIngredients()` ne renvoie pas directement des données, mais un **`Observable`**. 
Imaginez l'Observable comme un "tuyau". Lorsque vous appelez l'API, vous ne savez pas quand la réponse arrivera (cela dépend du réseau). Le composant devra donc s'abonner (`.subscribe()`) à ce tuyau pour être averti dès que les données arrivent.

### Le typage générique `<Ingredient[]>`
En écrivant `this.http.get<Ingredient[]>(...)`, vous informez Angular que la réponse JSON reçue du serveur doit être traitée comme un tableau d'ingrédients conforme à l'interface que nous avons créée précédemment.

---

## 5. Utilisation rapide dans un composant (Exemple)

Pour tester si votre service fonctionne, vous pouvez l'injecter dans un composant (ex: `IngredientListComponent`) :

```typescript
export class IngredientListComponent implements OnInit {
  ingredients: Ingredient[] = [];

  constructor(private ingredientService: IngredientService) {}

  ngOnInit(): void {
    this.ingredientService.getIngredients().subscribe({
      next: (data) => {
        this.ingredients = data;
        console.log('Ingrédients chargés avec succès !', this.ingredients);
      },
      error: (err) => console.error('Erreur lors du chargement', err)
    });
  }
}
```

---
**Défi :** Modifiez votre page de management des ingrédients pour afficher dynamiquement la liste des noms d'huiles récupérés depuis l'API au lieu de votre liste de test habituelle.
