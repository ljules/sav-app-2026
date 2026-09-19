# Documentation API REST --- SavonAPI

**Version analysée : 17 septembre 2026**\
**Base locale habituelle :** `http://localhost:8080`\
**API métier :** `/api-savon/v1`\
**Authentification :** `/auth`

> Cette documentation est dérivée de l'implémentation Kotlin/Spring Boot
> fournie. Elle est destinée au développement du client Angular,
> notamment avec Codex. Le code du backend reste la référence en cas
> d'écart.

------------------------------------------------------------------------

## 1. Authentification et autorisation

L'API utilise des **JWT Bearer tokens** et des **refresh tokens**.

Pour les routes protégées, envoyer :

``` http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Rôles utilisés :

-   `ROLE_UTILISATEUR`
-   `ROLE_ADMIN`

Le backend est **stateless**. Le JWT contient le nom d'utilisateur et le
rôle.

### Points importants pour le frontend

-   Un compte nouvellement inscrit est créé avec `estActif = false`.
-   Un utilisateur **non activé ne peut plus se connecter** :
    `/auth/login` renvoie `403 Forbidden` avec le motif
    `Compte non activé`.
-   Le renouvellement via `/auth/refresh` vérifie également `estActif`.
-   Un utilisateur avec `estBanned = true` est refusé par le service
    d'authentification.
-   Le refresh token est **rotatif** : lorsqu'il est utilisé, l'ancien
    refresh token est révoqué et un nouveau est renvoyé.
-   Attention : la propriété de l'access token n'a pas le même nom entre
    login et refresh :
    -   login → `token`
    -   refresh → `accessToken`

------------------------------------------------------------------------

# 2. Authentification

## POST `/auth/register`

Inscription d'un nouvel utilisateur.

**Accès : public**

### Corps

``` json
{
  "username": "laurent",
  "email": "laurent@example.com",
  "password": "motDePasse"
}
```

### Succès

``` json
{
  "message": "Inscription réussie. Un email de confirmation vous a été envoyé."
}
```

Le compte est créé avec le rôle `ROLE_UTILISATEUR` et reste inactif
jusqu'au clic sur le lien envoyé par email.

### Erreurs possibles

Le code lève actuellement des exceptions génériques notamment pour :

-   nom d'utilisateur déjà utilisé ;
-   email déjà utilisé ;
-   rôle `ROLE_UTILISATEUR` introuvable.

Le format HTTP exact de ces erreurs dépend de la gestion globale des
exceptions Spring.

------------------------------------------------------------------------

## GET `/auth/confirm-inscription?key=<token>`

Active le compte à partir du lien reçu par email.

**Accès : public**

### Succès

``` json
{
  "result": "ok"
}
```

### Token invalide ou expiré

``` json
{
  "result": "echec"
}
```

Le token d'activation expire après **24 heures**.

> Le backend renvoie actuellement du JSON. Pour une UX web complète, le
> frontend peut prévoir une page d'activation si le lien email est
> modifié pour pointer d'abord vers Angular, ou le backend peut à terme
> rediriger vers une route Angular.

------------------------------------------------------------------------

## POST `/auth/login`

Connexion par **username ou email**.

**Accès : public**

### Corps

``` json
{
  "identifier": "laurent@example.com",
  "password": "motDePasse"
}
```

### Succès

``` json
{
  "token": "<jwt_access_token>",
  "refreshToken": "<refresh_token>"
}
```

### Compte non activé

**HTTP 403**

``` text
Compte non activé
```

### Compte banni

Le service d'authentification refuse un utilisateur dont
`estBanned = true`. Le format HTTP exact dépend de la gestion des
exceptions Spring.

------------------------------------------------------------------------

## POST `/auth/refresh`

Renouvelle le JWT et effectue une **rotation du refresh token**.

**Accès : public**

### Corps

``` json
{
  "refreshToken": "<refresh_token>"
}
```

### Succès

``` json
{
  "accessToken": "<nouveau_jwt>",
  "refreshToken": "<nouveau_refresh_token>"
}
```

L'ancien refresh token est révoqué.

### Refresh token invalide ou expiré

**HTTP 401**

``` text
Refresh token invalide ou expiré
```

### Compte non activé

**HTTP 403**

``` text
Compte non activé
```

------------------------------------------------------------------------

# 3. Mot de passe oublié

## POST `/auth/mdp-oublie`

Déclenche la procédure de réinitialisation.

**Accès : public**

### Corps

``` json
{
  "email": "laurent@example.com"
}
```

Si l'utilisateur existe et est actif :

1.  les anciennes demandes de reset sont marquées comme utilisées ;
2.  un nouveau token est créé ;
3.  un code secret à 6 chiffres est créé ;
4.  la demande expire après **30 minutes** ;
5.  un email contenant les informations nécessaires est envoyé.

### Réponse actuelle

La méthode ne renvoie pas de DTO explicite (`Unit` côté Kotlin). Les
erreurs telles que `Email introuvable` ou `Utilisateur non actif` sont
actuellement seulement accumulées puis affichées côté serveur avec
`println`.

> **Important pour le frontend :** cet endpoint ne permet donc pas
> actuellement de distinguer proprement succès et échec à partir d'un
> JSON métier.

------------------------------------------------------------------------

## POST `/auth/mdp-reset?key=<token>`

Valide le token, le code secret et le nouveau mot de passe.

**Accès : public**

### Corps

``` json
{
  "nouveauMotDePasse": "nouveauMotDePasse",
  "nouveauMotDePasseConfirmation": "nouveauMotDePasse",
  "code": "123456"
}
```

### Succès

``` json
{
  "result": "ok"
}
```

### Échec

``` json
{
  "errors": [
    "code invalide"
  ]
}
```

Erreurs métier possibles :

-   `expiration du code`
-   `les mots de passe ne correspondent pas`
-   `code invalide`
-   `deja utilise`

------------------------------------------------------------------------

# 4. Ingrédients

## Modèle `Ingredient`

``` ts
interface Ingredient {
  id?: number;
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
```

`ligneIngredients` n'est pas sérialisé dans le JSON (`@JsonIgnore`).

------------------------------------------------------------------------

## GET `/api-savon/v1/ingredient`

Retourne tous les ingrédients.

**Accès : public**

### Réponse

``` json
[
  {
    "id": 1,
    "nom": "Huile exemple",
    "iode": 0,
    "ins": 0,
    "sapo": 0,
    "volMousse": 0,
    "tenueMousse": 0,
    "douceur": 0,
    "lavant": 0,
    "durete": 0,
    "solubilite": 0,
    "sechage": 0,
    "estCorpsGras": true,
    "dateCreation": "2026-09-17T12:00:00"
  }
]
```

------------------------------------------------------------------------

## GET `/api-savon/v1/ingredient/{id}`

Retourne un ingrédient.

**Accès : ADMIN**

-   `200 OK` : ingrédient trouvé
-   `404 Not Found` : inexistant

------------------------------------------------------------------------

## POST `/api-savon/v1/ingredient`

Crée un ingrédient.

**Accès : ADMIN**

**Succès : `201 Created`**

Le corps utilise le modèle `Ingredient`.

------------------------------------------------------------------------

## PUT `/api-savon/v1/ingredient/{id}`

Modifie un ingrédient.

**Accès : ADMIN**

**Succès : `200 OK`**

Champs effectivement mis à jour :

`nom`, `iode`, `ins`, `sapo`, `volMousse`, `tenueMousse`, `douceur`,
`lavant`, `durete`, `solubilite`, `sechage`, `estCorpsGras`.

-   `404 Not Found` si l'ingrédient n'existe pas.

------------------------------------------------------------------------

## DELETE `/api-savon/v1/ingredient/{id}`

Supprime un ingrédient.

**Accès : ADMIN**

-   `204 No Content`
-   `404 Not Found`

------------------------------------------------------------------------

## DELETE `/api-savon/v1/ingredient/all`

Supprime tous les ingrédients.

**Accès : ADMIN**

**Réponse : `204 No Content`**

------------------------------------------------------------------------

# 5. Recettes

## DTO envoyé par le frontend : `RecetteFormDTO`

``` ts
interface RecetteFormDTO {
  id?: number | null;
  titre: string;
  description: string;
  surgraissage: number;
  avecSoude: boolean;
  concentrationAlcalin: number;
  ligneIngredients: LigneIngredientDTO[];
}

interface LigneIngredientDTO {
  ingredientId: number;
  recetteId?: number | null;
  quantite: number;
  pourcentage: number;
}
```

### Point essentiel pour la modification

Pour un `PUT /recette/{id}`, **le frontend n'a pas besoin de fournir
l'id de la recette dans le corps**. Le backend impose :

``` kotlin
recetteFormDTO.id = id
```

L'autorisation est contrôlée avant l'exécution :

``` text
ADMIN
OU
recette appartenant à l'utilisateur authentifié
```

Le contrôle est donc basé sur **l'id de l'URL + le JWT**, et non sur un
id fourni par le client dans le JSON.

------------------------------------------------------------------------

## GET `/api-savon/v1/recette`

Retourne uniquement les recettes de l'utilisateur authentifié.

**Accès : utilisateur authentifié**

### Réponse

`Recette[]`

------------------------------------------------------------------------

## GET `/api-savon/v1/recette/all`

Retourne toutes les recettes de tous les utilisateurs.

**Accès : ADMIN**

### Réponse

`Recette[]`

------------------------------------------------------------------------

## GET `/api-savon/v1/recette/{id}`

Retourne une recette particulière.

**Accès :**

-   ADMIN, ou
-   propriétaire de la recette.

### Réponses

-   `200 OK` + recette
-   `404 Not Found` si la recette n'existe pas
-   accès refusé par Spring Security si la recette n'appartient pas à
    l'utilisateur.

------------------------------------------------------------------------

## POST `/api-savon/v1/recette`

Crée une recette pour l'utilisateur identifié par le JWT.

**Accès : utilisateur authentifié**

### Exemple de corps

``` json
{
  "titre": "Savon test",
  "description": "Recette de test",
  "surgraissage": 8,
  "avecSoude": true,
  "concentrationAlcalin": 30,
  "ligneIngredients": [
    {
      "ingredientId": 1,
      "recetteId": null,
      "quantite": 500,
      "pourcentage": 50
    },
    {
      "ingredientId": 2,
      "recetteId": null,
      "quantite": 500,
      "pourcentage": 50
    }
  ]
}
```

**Succès : `201 Created`**

Le backend :

1.  associe automatiquement la recette à l'utilisateur du JWT ;
2.  crée les lignes d'ingrédients ;
3.  recalcule les résultats ;
4.  calcule la quantité d'alcalin ;
5.  calcule l'apport en eau ;
6.  attribue les mentions ;
7.  retourne la recette complète sauvegardée.

------------------------------------------------------------------------

## PUT `/api-savon/v1/recette/{id}`

Met à jour une recette.

**Accès :**

-   ADMIN, ou
-   propriétaire de la recette.

### Corps

Même structure que pour `POST /recette`.

L'id du corps peut être omis. L'id de l'URL est imposé par le backend.

### Succès actuel

**`201 Created`**

> Sémantiquement, `200 OK` serait plus conventionnel pour une mise à
> jour, mais le frontend doit actuellement accepter `201`.

### Attention technique

La méthode de service reconstruit/sauvegarde la recette à partir du DTO
et recalcule les résultats. Le frontend doit donc envoyer **l'état
complet attendu de la recette**, notamment toutes les lignes
d'ingrédients à conserver.

------------------------------------------------------------------------

## DELETE `/api-savon/v1/recette/{id}`

Supprime une recette.

**Accès :**

-   ADMIN, ou
-   propriétaire.

### Réponses

-   `204 No Content`
-   `404 Not Found`

------------------------------------------------------------------------

# 6. Structure JSON d'une recette renvoyée

Structure issue des entités actuellement sérialisées :

``` ts
interface Recette {
  id: number;
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

interface LigneIngredient {
  ligneIngredientId: {
    ingredientId: number;
    recetteId: number;
  };
  quantite: number;
  pourcentage: number;
  ingredient: Ingredient;
}

interface Resultat {
  resultatId: {
    caracteristiqueId: number;
    recetteId: number;
  };
  score: number;
  caracteristique: {
    id: number;
    nom: string;
  };
  mention: Mention | null;
}

interface Mention {
  id: number;
  label: string;
  noteMin: number;
  noteMax: number;
}
```

La propriété `utilisateur` de `Recette` n'est pas sérialisée.

------------------------------------------------------------------------

# 7. Calculs effectués par le backend lors d'une sauvegarde

Le frontend peut calculer les scores en temps réel pour l'UX, mais **le
backend recalcule les valeurs de référence lors de `POST` et `PUT`**.

Seuls les ingrédients `estCorpsGras = true` sont pris en compte pour
plusieurs calculs.

## INS et Iode

Pour chaque corps gras :

``` text
score = Σ(propriété ingrédient × pourcentage / 100)
```

Appliqué à :

-   `Indice INS`
-   `Iode`

## Scores pondérés par le surgraissage

Valeur initiale :

``` text
base = Σ(propriété ingrédient × pourcentage / 100)
```

Puis :

``` text
Douceur          = base × (1 + 0.01494 × surgraissage)
Lavant           = base × (1 - 0.01203 × surgraissage)
Volume de mousse = base × (1 - 0.00702 × surgraissage)
Tenue de mousse  = base × (1 + 0.01016 × surgraissage)
Dureté           = base × (1 - 0.00602 × surgraissage)
Solubilité       = base × (1 + 0.00250 × surgraissage)
Séchage          = base × (1 - 0.00503 × surgraissage)
```

`Douceur`, `Lavant`, `Solubilité` et `Séchage` utilisent uniquement les
corps gras.

Dans l'implémentation actuelle, `Volume de mousse`, `Tenue de mousse` et
`Dureté` utilisent toutes les lignes d'ingrédients.

## Quantité d'alcalin

### Soude --- NaOH (`avecSoude = true`)

``` text
qteAlcalinNormal =
Σ(quantite × sapo × (40 / 56 / 1000))
```

### Potasse --- KOH (`avecSoude = false`)

``` text
qteAlcalinNormal =
Σ((quantite × sapo) / 1000)
```

Puis :

``` text
qteAlcalin = qteAlcalinNormal / (concentrationAlcalin / 100)
qteAlcalin = qteAlcalin - qteAlcalin × (surgraissage / 100)
```

## Apport en eau

``` text
concentrationEau = (100 - concentrationAlcalin) / 100
apportEnEau = qteAlcalin × concentrationEau
```

------------------------------------------------------------------------

# 8. Profil utilisateur

## Modèle `UtilisateurDTO`

``` ts
interface UtilisateurDTO {
  id: number | null;
  username: string;
  email: string;
  nouveauMotDePasse: string | null;
  role: Role;
  estBanned: boolean;
  recettes: Recette[] | null;
}

interface Role {
  id: number | null;
  nom: string;
  nomLogic: string;
}
```

> `estActif` n'est actuellement **pas exposé** dans `UtilisateurDTO`.

------------------------------------------------------------------------

## GET `/api-savon/v1/profil`

Retourne le profil de l'utilisateur du JWT.

**Accès : utilisateur authentifié**

### Réponse

`UtilisateurDTO`

Le champ `nouveauMotDePasse` vaut `null`.

------------------------------------------------------------------------

## PUT `/api-savon/v1/profil`

Met à jour le profil de l'utilisateur du JWT.

**Accès : utilisateur authentifié**

L'id éventuellement envoyé par le client est ignoré : le backend
remplace l'id par celui de l'utilisateur authentifié.

### Corps attendu actuellement

Le backend désérialise un `UtilisateurDTO` complet :

``` json
{
  "id": null,
  "username": "nouveauUsername",
  "email": "nouveau@example.com",
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

Si `nouveauMotDePasse` vaut `null`, le mot de passe existant est
conservé.

> **Point de vigilance important :** le DTO permet actuellement à un
> utilisateur d'envoyer `role` et `estBanned`. Le service recopie ces
> deux propriétés sur l'entité. Même si l'id utilisateur est sécurisé
> par le JWT, ces champs devraient idéalement être exclus d'un DTO de
> modification de profil côté backend.

------------------------------------------------------------------------

# 9. Administration des utilisateurs

Base : `/api-savon/v1/utilisateur`

Toutes les routes suivantes nécessitent `ROLE_ADMIN`.

## GET `/api-savon/v1/utilisateur`

Retourne tous les utilisateurs sous forme de `UtilisateurDTO[]`.

## GET `/api-savon/v1/utilisateur/{id}`

-   `200 OK` + `UtilisateurDTO`
-   `404 Not Found`

## POST `/api-savon/v1/utilisateur`

Crée un utilisateur à partir d'un `UtilisateurDTO`.

Pour une création, `nouveauMotDePasse` est obligatoire.

### Succès

`200 OK` + utilisateur créé.

## PUT `/api-savon/v1/utilisateur/{id}`

Met à jour l'utilisateur correspondant à l'id de l'URL.

L'id éventuellement contenu dans le JSON est remplacé par l'id de l'URL.

### Succès

`200 OK` + utilisateur modifié.

## DELETE `/api-savon/v1/utilisateur/{id}`

-   `204 No Content`
-   `404 Not Found`

------------------------------------------------------------------------

# 10. Administration des rôles

## GET `/api-savon/v1/role`

Retourne tous les rôles.

**Accès : ADMIN**

### Structure

``` json
[
  {
    "id": 1,
    "nom": "Administrateur",
    "nomLogic": "ROLE_ADMIN"
  }
]
```

------------------------------------------------------------------------

# 11. Tableau récapitulatif des endpoints

  -------------------------------------------------------------------------------------------
  Méthode           Endpoint                              Accès             Usage
  ----------------- ------------------------------------- ----------------- -----------------
  POST              `/auth/register`                      Public            Inscription

  GET               `/auth/confirm-inscription?key=...`   Public            Activation

  POST              `/auth/login`                         Public            Connexion

  POST              `/auth/refresh`                       Public            Rotation JWT /
                                                                            refresh token

  POST              `/auth/mdp-oublie`                    Public            Demande reset mot
                                                                            de passe

  POST              `/auth/mdp-reset?key=...`             Public            Validation
                                                                            nouveau mot de
                                                                            passe

  GET               `/api-savon/v1/ingredient`            Public            Liste ingrédients

  GET               `/api-savon/v1/ingredient/{id}`       ADMIN             Détail ingrédient

  POST              `/api-savon/v1/ingredient`            ADMIN             Création
                                                                            ingrédient

  PUT               `/api-savon/v1/ingredient/{id}`       ADMIN             Modification
                                                                            ingrédient

  DELETE            `/api-savon/v1/ingredient/{id}`       ADMIN             Suppression
                                                                            ingrédient

  DELETE            `/api-savon/v1/ingredient/all`        ADMIN             Suppression de
                                                                            tous les
                                                                            ingrédients

  GET               `/api-savon/v1/recette`               Authentifié       Mes recettes

  GET               `/api-savon/v1/recette/all`           ADMIN             Toutes les
                                                                            recettes

  GET               `/api-savon/v1/recette/{id}`          Propriétaire /    Détail recette
                                                          ADMIN             

  POST              `/api-savon/v1/recette`               Authentifié       Création recette

  PUT               `/api-savon/v1/recette/{id}`          Propriétaire /    Modification
                                                          ADMIN             recette

  DELETE            `/api-savon/v1/recette/{id}`          Propriétaire /    Suppression
                                                          ADMIN             recette

  GET               `/api-savon/v1/profil`                Authentifié       Profil courant

  PUT               `/api-savon/v1/profil`                Authentifié       Modifier profil

  GET               `/api-savon/v1/utilisateur`           ADMIN             Liste
                                                                            utilisateurs

  GET               `/api-savon/v1/utilisateur/{id}`      ADMIN             Détail
                                                                            utilisateur

  POST              `/api-savon/v1/utilisateur`           ADMIN             Créer utilisateur

  PUT               `/api-savon/v1/utilisateur/{id}`      ADMIN             Modifier
                                                                            utilisateur

  DELETE            `/api-savon/v1/utilisateur/{id}`      ADMIN             Supprimer
                                                                            utilisateur

  GET               `/api-savon/v1/role`                  ADMIN             Liste rôles
  -------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 12. Consignes d'intégration pour le client Angular / Codex

1.  Conserver séparément l'access token et le refresh token.
2.  Ajouter `Authorization: Bearer <token>` aux appels protégés.
3.  À la connexion, lire l'access token dans `response.token`.
4.  Après refresh, lire l'access token dans `response.accessToken`.
5.  Remplacer **les deux tokens** après chaque refresh réussi.
6.  Traiter `403` sur login comme un cas possible de compte non activé.
7.  Après inscription, afficher une étape « consultez votre email pour
    activer votre compte » au lieu de connecter automatiquement
    l'utilisateur.
8.  Pour modifier une recette, appeler `PUT /api-savon/v1/recette/{id}`
    sans dépendre d'un `id` dans le body.
9.  Ne jamais considérer les scores calculés côté Angular comme
    persistés : le backend les recalc ule à la sauvegarde.
10. Pour le profil, tenir compte du fait que l'API actuelle attend un
    `UtilisateurDTO` complet ; éviter côté UI de permettre la
    modification de `role` ou `estBanned`.
11. Prévoir une gestion robuste des erreurs HTTP et ne pas supposer que
    tous les endpoints renvoient actuellement un format d'erreur
    homogène.

------------------------------------------------------------------------

# 13. Points backend à surveiller

Ces points décrivent l'implémentation actuelle et peuvent influencer le
frontend ou faire l'objet d'une prochaine évolution backend.

-   `/auth/login` renvoie `token`, tandis que `/auth/refresh` renvoie
    `accessToken`.
-   `/auth/mdp-oublie` ne renvoie pas actuellement de résultat métier
    exploitable.
-   `PUT /recette/{id}` renvoie `201 Created` au lieu du plus habituel
    `200 OK`.
-   `UtilisateurDTO` n'expose pas `estActif`.
-   `PUT /profil` reçoit `role` et `estBanned` et le service les
    applique : il serait préférable d'utiliser un DTO de profil dédié.
-   Les erreurs métier ne suivent pas encore un schéma JSON uniforme.
-   `/auth/testMail` existe dans le contrôleur et, puisque `/auth/**`
    est autorisé globalement par la configuration de sécurité, cette
    route est actuellement publiquement accessible. Elle contient en
    outre une adresse email codée en dur : cet endpoint de test devrait
    être supprimé ou protégé avant déploiement.
