# SavApp — formulation et gestion de recettes de savon

SavApp est une application web de formulation de savons développée dans le cadre du BTS SIO option SLAM du lycée Léonard de Vinci de Melun, pour le projet ADEPRO.

Elle permet de composer des recettes à partir d’ingrédients, de calculer leurs caractéristiques, de consulter des graphiques et de produire des fiches PDF. Les utilisateurs connectés peuvent gérer leurs recettes et leur profil. Des écrans d’administration permettent de gérer les ingrédients et les utilisateurs selon les droits du compte.

## Architecture

- **Frontend** : Angular 20.3, TypeScript, RxJS, Bootstrap 5, Chart.js et pdfmake.
- **Backend** : API REST Spring Boot / Kotlin, dans un dépôt séparé : [SavonAPI3](https://github.com/Timomoulin/SavonAPI3).
- **Base de données du backend** : MariaDB.
- **Authentification** : JWT d’accès et refresh token avec rotation automatique.

En développement, le navigateur charge Angular sur `http://localhost:4200` et appelle directement Spring Boot sur `http://localhost:8080`. Aucun proxy Angular n’est utilisé.

## Prérequis

Installer sur le poste de développement :

- Git ;
- Node.js compatible avec Angular CLI 20.3 : `^20.19.0`, `^22.12.0` ou `>=24.0.0`, avec npm ;
- un JDK **21** pour le backend, avec `JAVA_HOME` configuré ;
- MariaDB et un compte disposant des droits sur une base dédiée au développement ;
- Chrome pour exécuter les tests frontend avec Karma.

Les wrappers Gradle sont fournis par le backend : aucune installation globale de Gradle ou de Kotlin n’est nécessaire. Angular CLI est installé avec les dépendances du frontend.

Vérifier les outils :

```shell
git --version
node --version
npm --version
java -version
```

## 1. Récupérer les deux projets

Depuis le dossier dans lequel vous souhaitez travailler :

```shell
git clone https://github.com/ljules/sav-app-2026.git
git clone https://github.com/Timomoulin/SavonAPI3.git
```

Les deux dossiers sont indépendants :

```text
votre-dossier-de-travail/
├── sav-app-2026/    # Frontend Angular
└── SavonAPI3/      # Backend Spring Boot
```

## 2. Configurer et démarrer le backend

Dans un premier terminal :

```shell
cd SavonAPI3
```

Copier le modèle de configuration en `src/main/resources/application.properties`.

Sous Windows PowerShell :

```powershell
Copy-Item src/main/resources/application-copy.properties src/main/resources/application.properties
```

Sous Linux ou macOS :

```bash
cp src/main/resources/application-copy.properties src/main/resources/application.properties
```

Dans ce fichier, renseigner les paramètres propres à votre poste :

| Paramètre | Valeur à renseigner |
| --- | --- |
| `spring.datasource.url` | URL JDBC de votre base, par exemple `jdbc:mariadb://localhost:3306/savapp_dev` |
| `spring.datasource.username` | Compte MariaDB autorisé sur cette base |
| `spring.datasource.password` | Mot de passe de ce compte |
| `jwt.secret` | Secret aléatoire local d’au moins 32 octets, utilisé pour signer les JWT |
| `application.frontend-url` | `http://localhost:4200` |
| `spring.mail.*` | Serveur SMTP et identifiants nécessaires aux emails d’inscription et de récupération de mot de passe |

Créer la base `savapp_dev` dans MariaDB avant le démarrage si elle n’existe pas. Le fichier `application.properties` est ignoré par Git dans le dépôt backend ; conserver les secrets dans ce fichier local, jamais dans les fichiers Angular.

**Attention aux données :** le modèle backend utilise `spring.jpa.hibernate.ddl-auto=create-drop`. Ce mode recrée les tables au démarrage et les supprime à l’arrêt. Utiliser une base de développement dédiée. Pour conserver les données entre les redémarrages, adapter ce réglage avec l’équipe backend, par exemple à `update` pour un usage local.

Démarrer Spring Boot sous Windows PowerShell :

```powershell
.\gradlew.bat bootRun
```

Sous Linux ou macOS :

```bash
./gradlew bootRun
```

Le premier lancement télécharge Gradle et les dépendances. Laisser ce terminal ouvert et vérifier dans les logs que l’API démarre sur le port **8080**. Si nécessaire, définir `server.port=8080` dans la configuration locale.

L’endpoint public [liste des ingrédients](http://localhost:8080/api-savon/v1/ingredient) permet de vérifier que l’API répond. Les données de démonstration et comptes initialisés sont définis dans `DataInitializer.kt` du backend ; consulter ce fichier pour les comptes de votre version, ou utiliser le parcours d’inscription avec un SMTP fonctionnel.

Pour les détails spécifiques au serveur, consulter le [dépôt backend et sa documentation](https://github.com/Timomoulin/SavonAPI3).

## 3. Installer et démarrer le frontend

Dans un second terminal, depuis le dossier `sav-app-2026` :

```shell
npm ci
npm start
```

`npm ci` installe les versions enregistrées dans `package-lock.json`. `npm start` lance Angular en configuration `development`.

Ouvrir [SavApp en local](http://localhost:4200). Les changements dans le code frontend sont automatiquement pris en compte pendant le développement.

Le backend doit rester démarré pour charger les ingrédients, se connecter et utiliser les fonctionnalités qui appellent l’API.

## Configuration des environnements

| Mode | Fichier | Origine du backend |
| --- | --- | --- |
| Développement | `src/environments/environment.development.ts` | `http://localhost:8080` |
| Production | `src/environments/environment.ts` | Chaîne vide : origine courante du navigateur |

`angular.json` remplace automatiquement le fichier d’environnement de production par celui de développement lors de `npm start` et des builds `development`.

Pour changer l’adresse du backend local, modifier uniquement `apiUrl` dans `environment.development.ts`, sans ajouter de slash final, puis relancer le serveur Angular. Les services ajoutent les chemins `/auth/...` et `/api-savon/v1/...`.

En production, le frontend et l’API sont servis sous la même origine : Nginx sert Angular sur `/` et transmet `/auth/...` et `/api-savon/...` à Spring Boot. Aucune IP ni aucun nom DNS de production n’est intégré au frontend. La configuration de Nginx est gérée séparément. Le `base-href` de déploiement concerne le chemin du frontend, pas l’origine du backend.

## Authentification

Le service `AuthService` conserve le JWT et le refresh token dans `localStorage`. Avant un appel authentifié, l’interceptor vérifie la claim `exp` et renouvelle le couple de tokens si nécessaire, avec une marge de cinq secondes configurable dans `src/app/auth.config.ts`.

Les appels concurrents d’une même instance Angular partagent un seul renouvellement. Une réponse 403 seule ne déclenche pas de refresh. Si le renouvellement échoue, les deux tokens sont supprimés et l’utilisateur revient à la connexion. La déconnexion supprime également les deux tokens.

## Commandes utiles

À exécuter dans le dossier frontend :

| Commande | Usage |
| --- | --- |
| `npm start` | Serveur de développement sur le port 4200 |
| `npm run build -- --configuration development` | Compilation de développement |
| `npm run build` | Compilation de production |
| `npm run watch` | Compilation continue en développement |
| `npm test` | Tests Jasmine/Karma en mode interactif |
| `npm test -- --watch=false --browsers=ChromeHeadless` | Tests sans interface graphique, en une exécution |

Le build de production génère les fichiers du site dans `dist/sav-app/browser/`. Aucun script de lint n’est actuellement déclaré dans `package.json`.

## Organisation du frontend

```text
src/app/
├── components/     # Éléments partagés de l’interface
├── pages/          # Pages et écrans métier
├── services/       # Appels API, authentification et traitements
├── models/         # Modèles et objets d’échange
├── guards/         # Protection de la navigation
├── interceptors/   # Authentification des requêtes HTTP
└── auth.config.ts  # Marge de renouvellement du JWT
src/environments/   # Configuration dev/prod
public/             # Images, polices et autres ressources statiques
DOCUMENTATION/      # Documentation de l’API et du projet
```

## Problèmes courants

- **Installation npm ou compilation impossible** : vérifier la version de Node.js et relancer `npm ci` depuis la racine du frontend.
- **API inaccessible** : vérifier que Spring Boot fonctionne sur le port 8080 et que MariaDB est démarré et correctement configuré.
- **Erreur CORS dans le navigateur** : le backend doit autoriser l’origine `http://localhost:4200`. Le frontend appelle directement le port 8080 ; aucun proxy Angular ne masque cette configuration.
- **Inscription ou récupération de mot de passe incomplète** : vérifier le SMTP et `application.frontend-url` dans le backend.
- **Retour à la connexion après expiration** : si le refresh token a expiré ou a déjà été consommé, une nouvelle authentification est nécessaire.
