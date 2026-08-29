# Annexe — Documentation de l’API REST SAV-APP

> **Objectif de ce document**  
> Cette annexe décrit exclusivement le **contrat d’interface REST utile au frontend**.  
> Elle est destinée notamment à l’exploitation du projet frontend par Codex.
>
> Les détails d’implémentation du backend (persistance, services internes, calculs, architecture serveur, etc.) sont volontairement exclus.

## 1. Principes généraux

### 1.1 Préfixes d’API

Les ressources métier utilisent le préfixe :

```text
/api-savon/v1
```

L’authentification utilise :

```text
/auth
```

L’URL du serveur (hôte, port, environnement) n’est pas imposée par ce contrat et doit être configurée côté frontend.

### 1.2 Format des échanges

Les corps de requêtes et de réponses sont au format JSON.

Pour les requêtes comportant un corps :

```http
Content-Type: application/json
```

### 1.3 Authentification JWT

Après connexion ou inscription, l’API retourne un jeton JWT :

```json
{
  "token": "<JWT>"
}
```

Pour les routes protégées, le frontend doit transmettre ce jeton :

```http
Authorization: Bearer <JWT>
```

L’API est sans session serveur : le frontend conserve donc le jeton nécessaire aux appels authentifiés.

### 1.4 Niveaux d’accès

Trois niveaux sont utilisés dans la suite :

| Niveau | Signification |
|---|---|
| **Public** | Aucun JWT requis |
| **Authentifié** | JWT valide requis |
| **ADMIN** | JWT valide appartenant à un utilisateur ayant le rôle administrateur |
| **Propriétaire ou ADMIN** | L’utilisateur connecté doit posséder la recette ciblée, sauf s’il est administrateur |

> **Important pour le frontend :** `GET /api-savon/v1/ingredient` est public. Les autres opérations sur les ingrédients sont réservées aux administrateurs.

---

# 2. Schémas JSON de référence

Les schémas ci-dessous décrivent les objets effectivement utiles au frontend.

## 2.1 Jeton d’authentification

```json
{
  "token": "eyJ..."
}
```

| Champ | Type | Description |
|---|---|---|
| `token` | `string` | Jeton JWT à utiliser pour les appels protégés |

---

## 2.2 Rôle

```json
{
  "id": 1,
  "nom": "Administrateur",
  "nomLogic": "ROLE_ADMIN"
}
```

| Champ | Type | Description |
|---|---|---|
| `id` | `number \| null` | Identifiant du rôle |
| `nom` | `string` | Libellé affichable |
| `nomLogic` | `string` | Nom logique utilisé pour les droits, par exemple `ROLE_ADMIN` ou `ROLE_UTILISATEUR` |

---

## 2.3 Utilisateur

Objet retourné par les endpoints de profil et d’administration :

```json
{
  "id": 12,
  "username": "laurent",
  "email": "laurent@example.com",
  "nouveauMotDePasse": null,
  "role": {
    "id": 2,
    "nom": "Utilisateur",
    "nomLogic": "ROLE_UTILISATEUR"
  },
  "estBanned": false,
  "recettes": []
}
```

| Champ | Type | Description |
|---|---|---|
| `id` | `number \| null` | Identifiant utilisateur |
| `username` | `string` | Nom d’utilisateur |
| `email` | `string` | Adresse électronique |
| `nouveauMotDePasse` | `string \| null` | Champ d’entrée permettant de définir/changer le mot de passe ; normalement `null` dans les réponses |
| `role` | `Role` | Rôle complet de l’utilisateur |
| `estBanned` | `boolean` | État de bannissement |
| `recettes` | `Recette[] \| null` | Recettes associées lorsque présentes |

> Lors d’une modification, envoyer `nouveauMotDePasse: null` pour conserver le mot de passe actuel. Pour la création administrative d’un utilisateur, un nouveau mot de passe est requis.

---

## 2.4 Ingrédient

```json
{
  "id": 1,
  "nom": "Huile d'olive",
  "iode": 85.0,
  "ins": 105.0,
  "sapo": 190.0,
  "volMousse": 10.0,
  "tenueMousse": 20.0,
  "douceur": 70.0,
  "lavant": 10.0,
  "durete": 30.0,
  "solubilite": 25.0,
  "sechage": 40.0,
  "estCorpsGras": true,
  "dateCreation": "2026-03-20T17:26:00"
}
```

| Champ | Type | Description |
|---|---|---|
| `id` | `number \| null` | Identifiant |
| `nom` | `string` | Nom |
| `iode` | `number` | Indice d’iode |
| `ins` | `number` | Indice INS |
| `sapo` | `number` | Indice de saponification |
| `volMousse` | `number` | Contribution au volume de mousse |
| `tenueMousse` | `number` | Contribution à la tenue de mousse |
| `douceur` | `number` | Contribution à la douceur |
| `lavant` | `number` | Pouvoir lavant |
| `durete` | `number` | Contribution à la dureté |
| `solubilite` | `number` | Contribution à la solubilité |
| `sechage` | `number` | Contribution au séchage |
| `estCorpsGras` | `boolean` | Indique si l’ingrédient est considéré comme un corps gras |
| `dateCreation` | `string` | Date/heure de création au format ISO local |

---

## 2.5 Ligne d’ingrédient — format envoyé

Lors de la création ou modification d’une recette :

```json
{
  "ingredientId": 1,
  "recetteId": null,
  "quantite": 500.0,
  "pourcentage": 50.0
}
```

| Champ | Type | Description |
|---|---|---|
| `ingredientId` | `number` | Identifiant de l’ingrédient |
| `recetteId` | `number \| null` | Identifiant de recette ; peut être `null` lors d’une création |
| `quantite` | `number` | Quantité de l’ingrédient |
| `pourcentage` | `number` | Pourcentage de l’ingrédient dans la recette |

---

## 2.6 Formulaire recette — format envoyé

**C’est ce schéma qui doit être utilisé par le frontend pour les `POST` et `PUT` de recette.**

```json
{
  "id": null,
  "titre": "Savon exemple",
  "description": "Description de la recette",
  "surgraissage": 8.0,
  "avecSoude": true,
  "concentrationAlcalin": 30.0,
  "ligneIngredients": [
    {
      "ingredientId": 1,
      "recetteId": null,
      "quantite": 500.0,
      "pourcentage": 50.0
    }
  ]
}
```

| Champ | Type | Description |
|---|---|---|
| `id` | `number \| null` | Identifiant ; `null` pour une création. Pour un `PUT`, l’identifiant de l’URL fait référence |
| `titre` | `string` | Titre de la recette |
| `description` | `string` | Description |
| `surgraissage` | `number` | Taux de surgraissage |
| `avecSoude` | `boolean` | `true` pour la soude, `false` pour la potasse |
| `concentrationAlcalin` | `number` | Concentration de l’agent alcalin |
| `ligneIngredients` | `LigneIngredientForm[]` | Composition de la recette |

> Ne pas envoyer `qteAlcalin`, `apportEnEau` ou `resultats` dans ce formulaire : ce sont des données retournées par l’API.

---

## 2.7 Recette — format retourné

Une recette retournée par l’API contient les informations saisies, les lignes d’ingrédients enrichies et les résultats calculés :

```json
{
  "id": 42,
  "titre": "Savon exemple",
  "description": "Description de la recette",
  "surgraissage": 8.0,
  "apportEnEau": 120.5,
  "avecSoude": true,
  "concentrationAlcalin": 30.0,
  "qteAlcalin": 172.1,
  "ligneIngredients": [
    {
      "ligneIngredientId": {
        "ingredientId": 1,
        "recetteId": 42
      },
      "quantite": 500.0,
      "pourcentage": 50.0,
      "ingredient": {
        "id": 1,
        "nom": "Huile d'olive",
        "iode": 85.0,
        "ins": 105.0,
        "sapo": 190.0,
        "volMousse": 10.0,
        "tenueMousse": 20.0,
        "douceur": 70.0,
        "lavant": 10.0,
        "durete": 30.0,
        "solubilite": 25.0,
        "sechage": 40.0,
        "estCorpsGras": true,
        "dateCreation": "2026-03-20T17:26:00"
      }
    }
  ],
  "resultats": [
    {
      "resultatId": {
        "caracteristiqueId": 1,
        "recetteId": 42
      },
      "score": 85.0,
      "caracteristique": {
        "id": 1,
        "nom": "Iode"
      },
      "mention": {
        "id": 1,
        "label": "Optimal",
        "noteMin": 0.0,
        "noteMax": 100.0
      }
    }
  ],
  "dateCreation": "2026-03-20T17:26:00"
}
```

### Données calculées retournées

| Champ | Type | Description |
|---|---|---|
| `qteAlcalin` | `number` | Quantité d’agent alcalin calculée par l’API |
| `apportEnEau` | `number` | Apport en eau calculé par l’API |
| `resultats` | `Resultat[]` | Résultats des caractéristiques calculées |

Le frontend doit **consommer ces valeurs telles qu’elles sont retournées**. Leur méthode de calcul relève du backend et n’est pas définie dans ce contrat.

### Résultat

| Champ | Type | Description |
|---|---|---|
| `resultatId.caracteristiqueId` | `number` | Identifiant de la caractéristique |
| `resultatId.recetteId` | `number` | Identifiant de la recette |
| `score` | `number` | Score calculé |
| `caracteristique.id` | `number \| null` | Identifiant de caractéristique |
| `caracteristique.nom` | `string` | Nom de la caractéristique |
| `mention` | `Mention \| null` | Mention correspondant au score |

### Mention

| Champ | Type | Description |
|---|---|---|
| `id` | `number \| null` | Identifiant |
| `label` | `string` | Libellé |
| `noteMin` | `number` | Limite basse |
| `noteMax` | `number` | Limite haute |

---

# 3. Authentification

Base :

```text
/auth
```

## 3.1 Connexion

### `POST /auth/login`

**Accès : Public**

Authentifie un utilisateur et retourne un JWT.

### Requête

```json
{
  "identifier": "laurent",
  "password": "mot-de-passe"
}
```

| Champ | Type | Obligatoire | Description |
|---|---|---:|---|
| `identifier` | `string` | Oui | Identifiant utilisé pour l’authentification ; le backend accepte le principe username/email |
| `password` | `string` | Oui | Mot de passe |

### Réponse de succès

```json
{
  "token": "<JWT>"
}
```

Le frontend doit stocker le jeton puis l’envoyer dans l’en-tête `Authorization` des requêtes protégées.

---

## 3.2 Inscription

### `POST /auth/register`

**Accès : Public**

Crée un compte utilisateur standard et connecte immédiatement le nouvel utilisateur en retournant un JWT.

### Requête

```json
{
  "username": "laurent",
  "email": "laurent@example.com",
  "password": "mot-de-passe"
}
```

| Champ | Type | Obligatoire |
|---|---|---:|
| `username` | `string` | Oui |
| `email` | `string` | Oui |
| `password` | `string` | Oui |

### Réponse de succès

```json
{
  "token": "<JWT>"
}
```

### Cas d’erreur métier identifiés

L’inscription échoue notamment si :

- le nom d’utilisateur est déjà utilisé ;
- l’adresse électronique est déjà utilisée.

> Le backend actuel ne définit pas dans le contrôleur un schéma JSON d’erreur métier stable. Le frontend ne doit donc pas dépendre d’une structure détaillée d’erreur non documentée.

---

# 4. Ingrédients

Base :

```text
/api-savon/v1/ingredient
```

## 4.1 Lister les ingrédients

### `GET /api-savon/v1/ingredient`

**Accès : Public**

Retourne tous les ingrédients disponibles.

### Réponse

**`200 OK`**

```json
[
  {
    "id": 1,
    "nom": "Huile d'olive",
    "iode": 85.0,
    "ins": 105.0,
    "sapo": 190.0,
    "volMousse": 10.0,
    "tenueMousse": 20.0,
    "douceur": 70.0,
    "lavant": 10.0,
    "durete": 30.0,
    "solubilite": 25.0,
    "sechage": 40.0,
    "estCorpsGras": true,
    "dateCreation": "2026-03-20T17:26:00"
  }
]
```

---

## 4.2 Lire un ingrédient

### `GET /api-savon/v1/ingredient/{id}`

**Accès : ADMIN**

| Paramètre | Emplacement | Type | Description |
|---|---|---|---|
| `id` | Path | `number` | Identifiant de l’ingrédient |

### Réponses

- **`200 OK`** : objet `Ingredient`
- **`404 Not Found`** : ingrédient inexistant

---

## 4.3 Créer un ingrédient

### `POST /api-savon/v1/ingredient`

**Accès : ADMIN**

### Corps

Objet `Ingredient`. Pour une création, `id` peut être `null`.

```json
{
  "id": null,
  "nom": "Nouvel ingrédient",
  "iode": 50.0,
  "ins": 120.0,
  "sapo": 190.0,
  "volMousse": 20.0,
  "tenueMousse": 30.0,
  "douceur": 60.0,
  "lavant": 20.0,
  "durete": 40.0,
  "solubilite": 30.0,
  "sechage": 40.0,
  "estCorpsGras": true
}
```

### Réponse

**`201 Created`** avec l’ingrédient créé.

---

## 4.4 Modifier un ingrédient

### `PUT /api-savon/v1/ingredient/{id}`

**Accès : ADMIN**

Le `id` de l’URL désigne l’ingrédient à modifier.

### Corps

Même structure métier qu’un `Ingredient`. Les propriétés modifiables sont :

`nom`, `iode`, `ins`, `sapo`, `volMousse`, `tenueMousse`, `douceur`, `lavant`, `durete`, `solubilite`, `sechage`, `estCorpsGras`.

### Réponses

- **`200 OK`** : ingrédient mis à jour
- **`404 Not Found`** : ingrédient inexistant

---

## 4.5 Supprimer un ingrédient

### `DELETE /api-savon/v1/ingredient/{id}`

**Accès : ADMIN**

### Réponses

- **`204 No Content`** : suppression effectuée
- **`404 Not Found`** : ingrédient inexistant

---

## 4.6 Supprimer tous les ingrédients

### `DELETE /api-savon/v1/ingredient/all`

**Accès : ADMIN**

### Réponse

**`204 No Content`**

> Endpoint administratif destructif. Ne doit pas être appelé depuis une fonctionnalité utilisateur standard.

---

# 5. Recettes

Base :

```text
/api-savon/v1/recette
```

## 5.1 Lister les recettes de l’utilisateur connecté

### `GET /api-savon/v1/recette`

**Accès : Authentifié**

Retourne uniquement les recettes associées à l’utilisateur identifié par le JWT.

### Réponse

**`200 OK`**

```json
[
  {
    "...": "Recette"
  }
]
```

La structure de chaque élément correspond au schéma `Recette` décrit plus haut.

---

## 5.2 Lister toutes les recettes

### `GET /api-savon/v1/recette/all`

**Accès : ADMIN**

Retourne toutes les recettes.

### Réponse

**`200 OK`** — `Recette[]`

---

## 5.3 Lire une recette

### `GET /api-savon/v1/recette/{id}`

**Accès : Propriétaire ou ADMIN**

| Paramètre | Emplacement | Type |
|---|---|---|
| `id` | Path | `number` |

### Réponses

- **`200 OK`** : recette complète
- **`404 Not Found`** : recette inexistante

L’accès peut également être refusé par la couche de sécurité lorsque l’utilisateur n’est ni propriétaire ni administrateur.

---

## 5.4 Créer une recette

### `POST /api-savon/v1/recette`

**Accès : Authentifié**

La recette créée est associée à l’utilisateur connecté.

### Corps

Utiliser **exclusivement le schéma `RecetteForm`**, et non la structure complète d’une recette retournée.

```json
{
  "id": null,
  "titre": "Savon exemple",
  "description": "Description",
  "surgraissage": 8.0,
  "avecSoude": true,
  "concentrationAlcalin": 30.0,
  "ligneIngredients": [
    {
      "ingredientId": 1,
      "recetteId": null,
      "quantite": 500.0,
      "pourcentage": 50.0
    }
  ]
}
```

### Réponse

**`201 Created`** — recette complète créée, incluant notamment les valeurs et résultats calculés par l’API.

---

## 5.5 Modifier une recette

### `PUT /api-savon/v1/recette/{id}`

**Accès : Propriétaire ou ADMIN**

### Corps

Même schéma `RecetteForm` que pour la création.

L’identifiant de référence est celui fourni dans l’URL.

### Réponse actuelle

**`201 Created`** — recette résultante.

> **Attention :** le statut `201 Created` est bien le comportement actuel de l’API pour cette opération `PUT`. Le frontend doit tolérer ce statut comme un succès et ne pas exiger exclusivement `200 OK`.

---

## 5.6 Supprimer une recette

### `DELETE /api-savon/v1/recette/{id}`

**Accès : Propriétaire ou ADMIN**

### Réponses

- **`204 No Content`** : suppression effectuée
- **`404 Not Found`** : recette inexistante ou non accessible selon le contrôle effectué

---

# 6. Profil de l’utilisateur connecté

Base :

```text
/api-savon/v1/profil
```

## 6.1 Obtenir son profil

### `GET /api-savon/v1/profil`

**Accès : Authentifié**

Retourne le profil correspondant au JWT courant.

### Réponse

**`200 OK`** — `Utilisateur`

```json
{
  "id": 12,
  "username": "laurent",
  "email": "laurent@example.com",
  "nouveauMotDePasse": null,
  "role": {
    "id": 2,
    "nom": "Utilisateur",
    "nomLogic": "ROLE_UTILISATEUR"
  },
  "estBanned": false,
  "recettes": []
}
```

---

## 6.2 Modifier son profil

### `PUT /api-savon/v1/profil`

**Accès : Authentifié**

L’utilisateur ciblé est déterminé par le JWT. Le frontend n’a pas besoin de mettre un identifiant dans l’URL.

### Corps

```json
{
  "id": 12,
  "username": "nouveauNom",
  "email": "nouvelle-adresse@example.com",
  "nouveauMotDePasse": null,
  "role": {
    "id": 2,
    "nom": "Utilisateur",
    "nomLogic": "ROLE_UTILISATEUR"
  },
  "estBanned": false,
  "recettes": []
}
```

Pour changer le mot de passe :

```json
{
  "id": 12,
  "username": "nouveauNom",
  "email": "nouvelle-adresse@example.com",
  "nouveauMotDePasse": "nouveau-mot-de-passe",
  "role": {
    "id": 2,
    "nom": "Utilisateur",
    "nomLogic": "ROLE_UTILISATEUR"
  },
  "estBanned": false,
  "recettes": []
}
```

### Réponse

**`200 OK`** — profil utilisateur mis à jour.

> Le contrat actuel utilise le DTO utilisateur complet pour la mise à jour. Le frontend doit donc préserver les propriétés nécessaires (`role`, `estBanned`, etc.) lorsqu’il construit la requête, même si l’écran de profil ne les permet pas directement à l’utilisateur.

---

# 7. Administration des utilisateurs

Base :

```text
/api-savon/v1/utilisateur
```

Tous les endpoints de cette section sont réservés aux administrateurs.

## 7.1 Lister les utilisateurs

### `GET /api-savon/v1/utilisateur`

**Accès : ADMIN**

### Réponse

**`200 OK`** — `Utilisateur[]`

---

## 7.2 Lire un utilisateur

### `GET /api-savon/v1/utilisateur/{id}`

**Accès : ADMIN**

### Réponses

- **`200 OK`** : utilisateur
- **`404 Not Found`** : utilisateur inexistant

---

## 7.3 Créer un utilisateur

### `POST /api-savon/v1/utilisateur`

**Accès : ADMIN**

### Corps

```json
{
  "id": null,
  "username": "nouvelUtilisateur",
  "email": "utilisateur@example.com",
  "nouveauMotDePasse": "mot-de-passe",
  "role": {
    "id": 2,
    "nom": "Utilisateur",
    "nomLogic": "ROLE_UTILISATEUR"
  },
  "estBanned": false,
  "recettes": []
}
```

`nouveauMotDePasse` est requis pour une création.

### Réponse

**`200 OK`** — utilisateur créé.

> Le backend actuel retourne `200 OK` et non `201 Created` pour cette création.

---

## 7.4 Modifier un utilisateur

### `PUT /api-savon/v1/utilisateur/{id}`

**Accès : ADMIN**

### Corps

Objet `Utilisateur`.

L’identifiant de l’URL est prioritaire : le backend cible cet identifiant indépendamment de la valeur `id` reçue dans le corps.

Pour conserver le mot de passe existant :

```json
"nouveauMotDePasse": null
```

Pour le remplacer :

```json
"nouveauMotDePasse": "nouveau-mot-de-passe"
```

### Réponse

**`200 OK`** — utilisateur mis à jour.

---

## 7.5 Supprimer un utilisateur

### `DELETE /api-savon/v1/utilisateur/{id}`

**Accès : ADMIN**

### Réponses

- **`204 No Content`** : suppression effectuée
- **`404 Not Found`** : utilisateur inexistant

---

# 8. Administration des rôles

Base :

```text
/api-savon/v1/role
```

## 8.1 Lister les rôles

### `GET /api-savon/v1/role`

**Accès : ADMIN**

Retourne les rôles disponibles. Cet endpoint peut notamment alimenter un sélecteur de rôle dans l’interface d’administration des utilisateurs.

### Réponse

**`200 OK`**

```json
[
  {
    "id": 1,
    "nom": "Administrateur",
    "nomLogic": "ROLE_ADMIN"
  },
  {
    "id": 2,
    "nom": "Utilisateur",
    "nomLogic": "ROLE_UTILISATEUR"
  }
]
```

---

# 9. Tableau récapitulatif des endpoints

| Méthode | Endpoint | Accès | Usage |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Connexion |
| `POST` | `/auth/register` | Public | Inscription |
| `GET` | `/api-savon/v1/ingredient` | Public | Liste des ingrédients |
| `GET` | `/api-savon/v1/ingredient/{id}` | ADMIN | Détail ingrédient |
| `POST` | `/api-savon/v1/ingredient` | ADMIN | Création ingrédient |
| `PUT` | `/api-savon/v1/ingredient/{id}` | ADMIN | Modification ingrédient |
| `DELETE` | `/api-savon/v1/ingredient/{id}` | ADMIN | Suppression ingrédient |
| `DELETE` | `/api-savon/v1/ingredient/all` | ADMIN | Suppression de tous les ingrédients |
| `GET` | `/api-savon/v1/recette` | Authentifié | Recettes de l’utilisateur |
| `GET` | `/api-savon/v1/recette/all` | ADMIN | Toutes les recettes |
| `GET` | `/api-savon/v1/recette/{id}` | Propriétaire ou ADMIN | Détail recette |
| `POST` | `/api-savon/v1/recette` | Authentifié | Création recette |
| `PUT` | `/api-savon/v1/recette/{id}` | Propriétaire ou ADMIN | Modification recette |
| `DELETE` | `/api-savon/v1/recette/{id}` | Propriétaire ou ADMIN | Suppression recette |
| `GET` | `/api-savon/v1/profil` | Authentifié | Profil courant |
| `PUT` | `/api-savon/v1/profil` | Authentifié | Modification profil |
| `GET` | `/api-savon/v1/utilisateur` | ADMIN | Liste utilisateurs |
| `GET` | `/api-savon/v1/utilisateur/{id}` | ADMIN | Détail utilisateur |
| `POST` | `/api-savon/v1/utilisateur` | ADMIN | Création utilisateur |
| `PUT` | `/api-savon/v1/utilisateur/{id}` | ADMIN | Modification utilisateur |
| `DELETE` | `/api-savon/v1/utilisateur/{id}` | ADMIN | Suppression utilisateur |
| `GET` | `/api-savon/v1/role` | ADMIN | Liste des rôles |

---

# 10. Consignes d’intégration frontend / Codex

Cette section résume les règles importantes à respecter lors de la finalisation du frontend.

1. **Ne pas réimplémenter les calculs métier des recettes dans le frontend.**  
   Les propriétés calculées (`qteAlcalin`, `apportEnEau`, `resultats`, scores, mentions) doivent être consommées depuis les réponses de l’API.

2. **Distinguer le formulaire de recette de la recette retournée.**  
   Les `POST`/`PUT` utilisent `RecetteForm`, tandis que les `GET` et réponses de sauvegarde retournent une recette enrichie.

3. **Ajouter automatiquement le JWT aux requêtes protégées.**  
   Utiliser :
   ```http
   Authorization: Bearer <JWT>
   ```

4. **Ne pas ajouter le JWT à `POST /auth/login` et `POST /auth/register`.**  
   `GET /api-savon/v1/ingredient` est également accessible publiquement.

5. **Respecter les droits dans l’interface.**  
   Les fonctionnalités d’administration des ingrédients, utilisateurs, rôles et de consultation globale des recettes doivent être réservées à un utilisateur dont `role.nomLogic === "ROLE_ADMIN"`.

6. **Pour les recettes ordinaires, travailler sur les recettes du compte courant.**  
   `GET /api-savon/v1/recette` fournit directement cette collection.

7. **Considérer `201 Created` comme un succès pour `PUT /api-savon/v1/recette/{id}`.**  
   C’est le comportement actuel de l’API.

8. **Ne pas inventer de contrats d’erreur.**  
   En dehors des statuts explicitement documentés (`404`, `204`, etc.), le backend actuel ne garantit pas une structure JSON d’erreur uniforme. Le frontend doit prévoir une gestion générique des erreurs HTTP.

9. **Pour les mises à jour d’utilisateur, préserver le DTO complet.**  
   En particulier, ne pas perdre `role` ou `estBanned` lors d’une modification de profil.

10. **Ne pas dépendre de détails internes au backend.**  
    Ce document constitue le contrat d’intégration à utiliser pour la finalisation du frontend.

---

## 11. Vue synthétique du contrat TypeScript

Cette section est indicative et peut servir de base aux interfaces frontend.

```typescript
export interface AuthToken {
  token: string;
}

export interface Role {
  id: number | null;
  nom: string;
  nomLogic: string;
}

export interface Ingredient {
  id: number | null;
  nom: string;
  iode: number;
  ins: number;
  sapo: number;
  volMousse: number;
  tenueMousse: number;
  douceur: number;
  lavant: number;
  durete: number;
  solubilite: number;
  sechage: number;
  estCorpsGras: boolean;
  dateCreation?: string;
}

export interface LigneIngredientForm {
  ingredientId: number;
  recetteId: number | null;
  quantite: number;
  pourcentage: number;
}

export interface RecetteForm {
  id: number | null;
  titre: string;
  description: string;
  surgraissage: number;
  avecSoude: boolean;
  concentrationAlcalin: number;
  ligneIngredients: LigneIngredientForm[];
}

export interface LigneIngredient {
  ligneIngredientId: {
    ingredientId: number;
    recetteId: number;
  };
  quantite: number;
  pourcentage: number;
  ingredient: Ingredient;
}

export interface Caracteristique {
  id: number | null;
  nom: string;
}

export interface Mention {
  id: number | null;
  label: string;
  noteMin: number;
  noteMax: number;
}

export interface Resultat {
  resultatId: {
    caracteristiqueId: number;
    recetteId: number;
  };
  score: number;
  caracteristique: Caracteristique | null;
  mention: Mention | null;
}

export interface Recette {
  id: number | null;
  titre: string;
  description: string;
  surgraissage: number;
  apportEnEau: number;
  avecSoude: boolean;
  concentrationAlcalin: number;
  qteAlcalin: number;
  ligneIngredients: LigneIngredient[];
  resultats: Resultat[];
  dateCreation: string;
}

export interface Utilisateur {
  id: number | null;
  username: string;
  email: string;
  nouveauMotDePasse: string | null;
  role: Role;
  estBanned: boolean;
  recettes: Recette[] | null;
}
```

> Ces interfaces représentent le contrat observé dans l’API actuelle. Elles ne prescrivent pas l’architecture des services ou composants Angular.
