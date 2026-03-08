# <h1 style="text-align: center; font-weight:bold ">REPRISE PROJET APRES INTERRUPTION VACANCES FEVRIER-MARS 2026</h1>


## <u>**Remise en contexte :**</u>

Sur la semaine du 16 au 20 février 2026 vous avez commencé le projet en réalisant les étapes suivantes :

1. **Intégration du contexte métier :**
    - Présention du projet par l'équipe enseignante;
2. **Découverte de l'algorithme de calcul de la SaF :**
    - Vous avez mis en application l'algorithme de calcul pour la **S**aponifiation à **F**roid (**SaF**) en complétant un tableau **`.xlsx`**
3. **Analyse de l'API backend existante :**
    - Exploitation de l'API backend fourni (développé en **Kotlin** et avec le framework **Spring Boot**);
    - Utilisation de l'API avec le logiciel **Bruno** : Réalisation des opérations **CRUD** sur l'ensemble des entités : *ingredient* et *recette*;
4. **Maquettage :**
    - Réalisation avec le ou les outil(s)
 de votre choix d'une maquette de l'application.
 5. **Initialisation et structuration de l'application web avec _Angular_ :**
    - Création du projet avec la **CLI Angular**
    - Création de l'ensemble des **composants** de type **page**;
    - Création du **routeur** pour la navigation des pages;
    - Implémentation des éléments de style pour coller à votre maquette.   


## <u>**Proposition du code CSS global :**</u>

Dans une application **Angular** le code **css** partagé par l'ensemble des composants est à placer dans le fichier : **`src/styles.css`** <br>
Les composant peuvent avoir du code **css** spécifique que l'on place alors dans le fichier **`.css`** du composant.

<br>

> **Attention avec les fichiers de style CSS** :<br>
> Nous vous proposons des éléments **css** à placer les fichiers **`.css`** global ou des composants. Ce sont que des éléments de proposition pouvant être intégralement, partiellement intégré voire ignoré. Si vous voulez respecter le stye de votre maquette, le code **css** fournit ne devra pas être intégré mais pourra éventuellement à adapter votre codes **css** notament pour les liens d'accès aux assets comme les fonds de page.
>

<br>

<div style="page-break-after: always;"></div>

### <u>**Proposition de code css général à placer selon votre choix :**</u>

Selon votre startégie, copier intégralement, partiellement le code **css** suivant :

``` css
/*
-------------------------------------
Définition des constantes de styles :
-------------------------------------
*/
:root {
    /* Hauteur de la top barre :*/
    --top-bar-height: 70px; 

    /* Définition des couleurs de la charte graphique : */
    --green-charter: rgb(138, 160, 23);
    --brown-charter: rgb(74, 64, 56);
    --dark-charter: rgb(46, 46, 46);
    --purple-charter: rgb(126, 31, 162);
    --dark-side-charter: rgb(35, 35, 35);

  }


/*
--------------------
Définition du fond :
--------------------
*/
body {
    background-image: linear-gradient(0deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url('/backgrounds/fond.jpg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover; /*contain*/ 
    background-attachment: fixed;
  }
```

<div style="page-break-after: always;"></div>


## <u>**Ajout d'un composant page pour les mentions légales :**</u>

Nous n'avons pas encore prévu de page pour placer les mentions légales. Cette page sera accessible via un lien placé dans le footer. En pratique nous vous avions juste propos& du contenu pour la page (code _HTML_), mais pas en détail la démarche pour générer le composant page et l'entrée à rajouter dans le routeur pour permettre l'accès à la page.
Si vous n'avez par réalisé ces démarche, veuillez les réaliser avec les instructions suivantes, dans le cas contraire vous pouvez directement passer à la partie suivante.


### <u>**Création du composant legal-notice-page :**</u>

Générer votre composant **legal-notice-page**

Instruction à exécuter dans le terminal :

```sh
ng g c pages/legal-notice-page
```


### <u>**Code statique du template du composant `legal-notice-page`**</u>

Ouvrir le fichier **`src/app/pages/legal-notice-page/legal-notice-page.html`**

Coller le code de la page suivante dans le fichier :

<div style="page-break-after: always;"></div>


```html
<div class="legal-notices-pages">
    <h1>Mentions Légales</h1>

    <p><u>Dernière mise à jour :</u> 10 mars 2025</p>

  
    <h2>1. Éditeur du site</h2>
    <p>
        <ul>
            <li>
                <b>Raison sociale :</b> ADEPRO
            </li>
            <li>
                <b>Forme juridique :</b> Société à responsabilité limitée (SARL) au capital de 2 000 €
            </li>
            <li>
                <b>Siège social :</b> Central Canebière – 10 Rue de la République, 13001 Marseille, France
            </li>
            <li>
                <b>SIRET :</b> 487 474 421 00020
            </li>
            <li>
                <b>Téléphone :</b> +33 (0)6 78 50 33 77
            </li>
            <li>
                <b>Email :</b> contact&#64;adepro-consultant.fr
            </li>
            
        </ul>
    
  
    <h2>2. Hébergement du site</h2>
    <p>
      Les informations concernant l'hébergeur du site seront mises à jour une fois la plateforme d'hébergement choisie.
    </p>
  
    <h2>3. Directeur de la publication</h2>
    <p>
      <b>Nom :</b> Laurent Bousquet
    </p>
  
    <h2>4. Collecte et traitement des données personnelles</h2>
        <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD),
            nous informons les utilisateurs que les données collectées sur ce site sont les nom,
            prénom et adresse email. Ces informations sont utilisées exclusivement pour assurer la bonne gestion de leur compte, permettant notamment la sauvegarde de leurs recettes de savon.
        </p>
        <p>
            Les utilisateurs disposent d'un droit d'accès, de rectification et de suppression de leurs données personnelles.
            Pour exercer ces droits, veuillez contacter : contact&#64;adepro-consultant.fr
        </p>
  
    <h2>5. Propriété intellectuelle</h2>
        <p>
            Le contenu de ce site (textes, images, vidéos, etc.) est protégé par le droit d'auteur.
            Toute reproduction, distribution ou utilisation sans autorisation préalable est interdite.
        </p>
  
    <h2>6. Liens hypertextes</h2>
        <p>
            Ce site peut contenir des liens vers des sites externes.
            <b>ADEPRO</b> n'est pas responsable du contenu de ces sites et décline toute responsabilité en cas de dommages
            résultant de leur utilisation.
        </p>
  
    <h2>7. Cookies</h2>
        <p>
            Ce site utilise des cookies pour améliorer l'expérience utilisateur. En naviguant sur ce site, vous acceptez l'utilisation de cookies. Vous pouvez configurer votre navigateur pour refuser les cookies.
        </p>
  
    <h2>8. Droit applicable</h2>
        <p>
            Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
        </p>
  </div> 

```

<div style="page-break-after: always;"></div>


Ajouter si besoin le code suivant dans le fichier **`legal-notice-page.css`**

``` css
.legal-notices-pages{
    background-color: white;
    box-shadow: 10px 10px 50px rgb(0, 0, 0, 0.5);
    padding: 40px 40px 50px 50px; /* top | right | bottom | left */
    margin-bottom: 0px;

    h1 {
        font-weight: bold;
        font-size: 2em;
        text-align: center;
        padding-bottom: 1.5em;
    }

    h2 {
        font-size: 1.5em;
        font-weight: bold;
        padding-top: 0.8em;
        padding-bottom: 0.5em;  
        color: var(--green-charter);       
    }

    p {
        padding-left: 1em;
        text-align: justify;
    }
}
```



### <u>**Ajout de la route de la page `legal-notice-page` dans le router :**</u>

Ouvrir le fichier **`src/app/app.routes.ts`** et rajouter la route pour accéder à la page **`legal-notice-page`** :

``` ts
    // Mentions légales :
    {path: "legal-notice", component: LegalNoticePage},
```

Exécuter **`ng serve`** si ça n'a pas encore été fait et tester l'accès à votre page avec cette URL : [http://localhost:4200/legal-notice](http://localhost:4200/legal-notice)


<div style="page-break-after: always;"></div>


## <u>**Footer & mentions légales pour se remettre dans le bain :**</u>

### <u>**Préparation & vérification :**</u>

Vous avez normalement dû créer un footer avec le composant **footer** dans votre application. Si vous l'avez implémenté, il doit déjà s'afficher dans votre application. Mais dans tous les cas, le composant doit déjà être présent.

Vérifier que votre application comporte bien la structure suivante pour les **composants** de type **page**.


```text
project-root/
│
├── public/
│
├── src/
│   └── app/
│       ├── components/
│       │    ├── footer/
│       │    └── navbar/            
│       │
│       └── pages/
│            ├── about-page/    
│            ├── account-manager-page/  
│            ├── home-page/  
│            ├── ingredients-manager-page/
|            ├── legal-notice-page/  <-- Le nom peut être différent
│            ├── login-page/  
│            ├── recipe-calculator-page/  
│            ├── recipe-manager-page/  
│            ├── subscribe-page/  
│            └── users-manager-page/  
├── ...
```

<div style="page-break-after: always;"></div>


### <u>**Intégration du footer dans son composant parent :**</u>

Tout comme pour le composant **navbar**, nous allons dans le composant principal **app* :
1. Importer le composant **navbar** dans le fichier **app.ts**
2. Insérer le composant **navbar** dans la vue dans le fichier de template **app.html**


#### Imporation de `navbar` dans `app.ts` :

**1/** Ouvrir le fichier **`src/app/app.ts`** et ajouter **`navbar`** dans la liste des imports :

```ts
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer], // Ajout de Footer
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('sav-app');
}
```

**2/** Ajouter le _selecteur_  **`app-footer`** dans le fichier **`src/app/html.ts`**. On ajoutera l'attribut de classe **Bootstrap** **`min-hv-100`** pour que le conteneur principal puisse occuper 100% de la hauteur de la zone d'affichage (_viewport_) et on utiliser un **`my-5`** pour centrer notre contenu tout en plaçant une marge de 5 en haut et en bas du conteneur placé entre les composants **navbar** et **footer**.

```html
<!-- NAVBAR DE L'APPLICATION -->
<app-navbar></app-navbar>

<!-- AFFICHAGE DU CONTENU ROUTE : -->
<div class="main-content container my-5 min-vh-100">
    <router-outlet></router-outlet>
</div>

<!-- FOOTER DE L'APPLICATION -->
<app-footer></app-footer>
```

<div style="page-break-after: always;"></div>


### <u>**Implémentation du code footer :**</u>

Nous allons maintenant ajouter le contenu de notre footer, il devra contenir les informations suivantes :
- URL vers le site d'**ADEPRO** : [https://www.adepro-consultant.fr/](https://www.adepro-consultant.fr/)
- Mail pour la prise de contact : [contact@adepro-consultant.fr](contact@adepro-consultant.fr)
- L'adresse : 
    >Central Canebière – 10 Rue de la République <br>
    >F-13001 Marseille <br>
    >France
- Le Lien vers la page des _mentions légales_ : On utiliser ici la syntaxe d'**Angular** pour exploiter la route que nous avons défini dans le routeur :
    - Code HTML pour l'accès à la page **about** : <br>**`<a routerLink="/about"  class="footer-link">À propos de nous</a>`**
    - Code HTML pour l'accès à la page **legal-notice** : <br>**`<a routerLink="/legal-notice" class="footer-link">Mentions légales</a>`**



Nous pourrons également ajouter d'autres éléments selon vos envie, pour notre part nous allons prendre la partir de transférer l'accès à la page **about** qui est actuellement dans la **navbar** afin de gagner en clarté dans cette dernière.

Nous vous proposons le code à la page suivante pour vous aider.

<div style="page-break-after: always;"></div>


#### <u>**Proposition de code HTML et CSS pour le footer :**</u>

##### **Code du template (fichier `src/components/footer/footer.html`) :**

``` html
<footer class="footer container-fluid p-0 mt-4">
    <div class="container">
        <div class="footer-row row align-items-center pt-2 pb-2">
    
            <!-- Colonne 1 : Logo -->
            <div class="col-xl-2 col-12 footer-col1 py-3">
                <img  src="./logos/adepro_logo_trans_inv.png"
                        alt="ADEPRO Logo"
                        class="footer-logo">
            </div>
            
            <!-- Colonne 2 : Contact -->
            <div class="col-xl-3 col-12 footer-col2 py-2">
                <div class="d-flex align-items-center">
                    <i class="footer-icon bi bi-globe me-2"></i>     
                    <a  href="https://www.adepro-consultant.fr/"
                            class="footer-link">
                        www.adepro-consultant.fr
                    </a>
                </div>

                <div class="d-flex align-items-center">
                    <i class="footer-icon bi bi-envelope-fill me-2"></i>
                    <a  href="mailto:contact@adepro-consultant.fr"
                            class="footer-link">
                        contact&#64;adepro-consultant.fr
                    </a>
                </div>

            </div>

    
            <!-- Colonne 3 : Adresse -->
            <div class="col-xl-5 col-12 footer-col3 d-flex align-items-center py-2">
                <a  href="https://www.google.com/maps/?q=adepro,marseille"
                    target="_blank"
                    title="Ouvrir dans GoogleMap">
                    <i class="bi bi-geo-alt-fill footer-icon"></i>
                </a>
                <div class="ms-2">
                    <p class="adresse-postale mb-0">Central Canebière – 10 Rue de la République
                                <br>F-13001 Marseille
                                <br>France
                    </p>
                </div>
            </div>
    
            <!-- Colonne 4 : Liens et mentions légales -->
            <div class="col-xl-2 col-12 footer-col4 d-flex align-items-center justify-content-start ms-0 py-2">
                <ul class="list-unstyled mb-0">
                    <li><a routerLink="/about"  class="footer-link">À propos de nous</a></li>
                    <li><a routerLink="/legal-notice" class="footer-link">Mentions légales</a></li>
                </ul>
            </div>
        
        </div>
  
    </div>

    <!-- Ligne copyright -->
    <div class="footer-bottom container-fluid justify-content-center">
        <div class="text-center">Copyright © 2026 - Adepro</div>
    </div>

   
</footer>
  
```

<div style="page-break-after: always;"></div>


##### **Code du style CSS (fichier `src/components/footer/footer.css`) :**

``` css
.footer {
    background: var(--dark-charter);
    color: white;
    /* padding: 20px 10px; */

    .footer-row {
        min-height: 100px;
    }

    .footer-logo {
        height: 30px;
    }

    .footer-icon {
        color: var(--green-charter);
    }

    /* .footer-col1 {
        width: 200px;
    } */

    .footer-col2 {
        border-left: solid 3px silver;
    }

    .footer-col3 {   
        border-left: solid 3px silver;     
        
        .adresse-postale {
            font-size: 0.8em;
        }
        .footer-icon {
            font-size: 3em;
        }
    }

    .footer-col4 {
        border-left: solid 3px silver;
    }

    .footer-link {
        font-size: 0.9em;
        color: white;
        text-decoration: none;
        font-weight: normal;

        &:hover {
            text-decoration: underline;
        }
    }

    .footer-icon {
        color: var(--purple-charter);
        font-size: 20px;
    }

    .footer-bottom {
        height: 25px;
        background: var(--green-charter);
        font-size: 0.8em;
        color: white;
    }
}

```

<div style="page-break-after: always;"></div>


#### <u>**Import du routeur dans la logique du composant footer :**</u>

Les liens d'accès comme à la page des mentions légales ne seront pas opérationnel sans import du routeur dans le fichier de la couche logique du composant **footer**.


##### **<u>A FAIRE :</u>**

Ouvrir le fichier **`src/app/footer/footer.ts`** et ajouter l'import du routeur :

``` ts
<footer class="footer container-fluid p-0 mt-4">
    <div class="container">
        <div class="footer-row row align-items-center pt-2 pb-2">
    
            <!-- Colonne 1 : Logo -->
            <div class="col-xl-2 col-12 footer-col1 py-3">
                <img  src="./logos/adepro_logo_trans_inv.png"
                        alt="ADEPRO Logo"
                        class="footer-logo">
            </div>
            
            <!-- Colonne 2 : Contact -->
            <div class="col-xl-3 col-12 footer-col2 py-2">
                <div class="d-flex align-items-center">
                    <i class="footer-icon bi bi-globe me-2"></i>     
                    <a  href="https://www.adepro-consultant.fr/"
                            class="footer-link">
                        www.adepro-consultant.fr
                    </a>
                </div>

                <div class="d-flex align-items-center">
                    <i class="footer-icon bi bi-envelope-fill me-2"></i>
                    <a  href="mailto:contact@adepro-consultant.fr"
                            class="footer-link">
                        contact&#64;adepro-consultant.fr
                    </a>
                </div>

            </div>

    
            <!-- Colonne 3 : Adresse -->
            <div class="col-xl-5 col-12 footer-col3 d-flex align-items-center py-2">
                <a  href="https://www.google.com/maps/?q=adepro,marseille"
                    target="_blank"
                    title="Ouvrir dans GoogleMap">
                    <i class="bi bi-geo-alt-fill footer-icon"></i>
                </a>
                <div class="ms-2">
                    <p class="adresse-postale mb-0">Central Canebière – 10 Rue de la République
                                <br>F-13001 Marseille
                                <br>France
                    </p>
                </div>
            </div>
    
            <!-- Colonne 4 : Liens et mentions légales -->
            <div class="col-xl-2 col-12 footer-col4 d-flex align-items-center justify-content-start ms-0 py-2">
                <ul class="list-unstyled mb-0">
                    <li><a routerLink="/about"  class="footer-link">À propos de nous</a></li>
                    <li><a routerLink="/legal-notice" class="footer-link">Mentions légales</a></li>
                </ul>
            </div>
        
        </div>
  
    </div>

    <!-- Ligne copyright -->
    <div class="footer-bottom container-fluid justify-content-center">
        <div class="text-center">Copyright © 2026 - Adepro</div>
    </div>

   
</footer>

```

<div style="page-break-after: always;"></div>


## <u>**Implémentation de la page d'accueil (composant **`home-page`**) :**</u>

Si vous n'avez rien réalisé ou peu avancé sur le contenu de la page d'accueil, nous vous proposons des éléments de correction que vous pouvez partiellement ou totalement intégrer dans votre projet.

Normalement la page est déjà accessible (le routeur a été renseigné pour rediriger directement dessus, la barre de navigation permet d'y retourner).

Vous trouverez ci-dessous le code du correctif pour le fichier de template. Vous trouverez également le contenu **CSS** pour ce composant (fichier **`src/app/pages/home-page/home-page.css`**)


### <u>**Proposition du code html (fichier `src/app/pages/home-page/home-page.html`) :**</u>

Avant d'aborder le code **html** du template, nous allons importer **`RouterLink`** et **`RouterLinkActive`** dans le fichier de logique du composant (**`src/app/pages/home-page/home-page.ts`**). En effet la page **home** de notre correctif contient 2 **URL** pointant sur 2 routes.


#### <u>**Code du fichier `home-page.ts` :**</u>

``` ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {

}
```

<div style="page-break-after: always;"></div>


#### <u>**Code du fichier `home-page.html` :**</u>


``` html
<div class="home-page">
    <h2>Bienvenue sur notre application</h2>

    <p>
        Avec notre application vous allez pouvoir formuler vos propres recettes de savon
        en utilisant la saponification à froid.
    </p>

    <div class="container row mb-4">
        <div class="col-12 col-lg-5 text-center py-4 ms-4">
            <img    src="./logos/Logo-Sav-App-02.jpeg"
            alt="Logo standard de la société ADEPRO"
            style="width: 300px; box-shadow: 10px 10px 20px rgb(0, 0, 0, 0.5);">
        </div>
    
        <div class="col-12 col-lg-5 text-center py-4 ms-0">
            <img    src="./backgrounds/fond-01.jpeg"
            alt="Logo standard de la société ADEPRO"
            style="width: 300px; box-shadow: 10px 10px 20px rgb(0, 0, 0, 0.5);">
        </div>
    </div>

    <p>
        Vous pouvez calculer des recettes avec la rubrique <a routerLink="/recipe-calculator"><b>"Calculateur"</b></a>.
        Mais vous pourrez également sauvegarder vos recettes pour les retrouver ultérieurement en vous inscrivant.
    </p>

    <p>
        Ce site vous est mis à disposition par la société <b>ADEPRO</b>.
    </p>
    
    <div class="text-center mt-3 mb-4">
        <img    src="./logos/adepro_logo_trans.png"
        alt="Logo standard de la société ADEPRO"
        style="width: 200px;">
    </div>

    <p>
        Découvrez en plus à notre sujet en consultant la rubrique <a routerLink="/about"><b>"A propos"</b></a>.
    </p>    
</div>
```


<div style="page-break-after: always;"></div>


### <u>**Proposition du code css (fichier `src/app/pages/home-page/home-page.css`) :**</u>

``` css
.home-page{
    background-color: white;
    box-shadow: 10px 10px 50px rgb(0, 0, 0, 0.5);
    padding: 40px 40px 50px 50px; /* top | right | bottom | left */
    margin-bottom: 0px;

    h1 {
        font-weight: bold;
        font-size: 2em;
        text-align: center;
        padding-bottom: 1.5em;
    }

    h2 {
        font-size: 1.5em;
        font-weight: bold;
        padding-top: 0.8em;
        padding-bottom: 0.5em;  
        color: var(--green-charter);   
    }

    h3 {
        font-size: 1.1em;
        font-weight: bold;
        padding-top: 0.8em;
        padding-bottom: 0.2em;
        color: var(--green-charter);
    }

    h4 {
        font-size: 1.0em;
        font-weight: bold;
        padding-top: 0.8em;
        padding-bottom: 0.2em;
        color: var(--green-charter);
    }

    p {
        padding-left: 1em;
        text-align: justify;
    }

    ul {
        padding-left: 3.0em;
    }

    .icon {
        color: var(--purple-charter);
    }

    a {
        color: var(--purple-charter); /* Change la couleur des liens */
        text-decoration: none; /* Supprime le soulignement */
    }
    
    /* Pour changer la couleur au survol */
    a:hover {
        color: var(--green-charter); /* Change la couleur au survol */
        text-decoration: underline; /* Ajoute un soulignement au survol si souhaité */
    }
}
```


<div style="page-break-after: always;"></div>


## <u>**Ajout d'un header (en-tête) :**</u>

Jusqu'à présent nous avons directement intégré le composant **navbar**. Dans cette partie nous allons améliorer justement notre composant **navbar** et l'intégrer dans un composant parent que nous nommerons **header**. Nous allons mener les actions suivantes :
- Création du composant **header**
- Intégration du composant enfant **navbar** dans son parent **header**
- Epuration :
    - Suppression du lien d'accès à la page **about**
    - Ajout d'icônes
    - Application des éléments de style CSS
    

### <u>**A FAIRE :**</u>

#### <u>**Génération du composant header :**</u>

Exécuter la commande **CLI Angular** pour générer le composant **header** :
- **`ng g c components/header`**


#### <u>**Intégration du composant enfant navbar dans son parent header :**</u>

Il faut importer le composant **navbar** dans le composant **header** en renseignent l'identifiant de la classe du composant **navbar** dans le fichier **Type Script** du **header** et le _selecteur_ de l'enfant **navbar** dans le fichier **html** du parent **header**.


##### <u>**Import dans le header (fichier : `src/app/components/header/header.ts`) :**</u>

``` ts
import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [Navbar, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})

export class Header {

}
```

<div style="page-break-after: always;"></div>


##### <u>**Insertion du sélecteur (fichier : `src/app/components/header/header.html`) :**</u>

``` html
<app-navbar></app-navbar>
```



#### <u>**Mise à jour du composant app**</u>

Actuellement le composant **app** accueille le composant **navbar**, il faut le substituer par son parent **header**.

##### <u>**Insertion du sélecteur (fichier : `src/app/app.ts`) :**</u>

``` ts
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer], // Remplacement de Navbar par Header
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('sav-app');
}
```


##### <u>**Insertion du sélecteur (fichier : `src/app/app.html`) :**</u>

``` html
<!-- HEADER DE L'APPLICATION -->
<app-header></app-header>

<!-- AFFICHAGE DU CONTENU ROUTE : -->
<div class="main-content container my-5 min-vh-100">
    <router-outlet></router-outlet>
</div>

<!-- FOOTER DE L'APPLICATION -->
<app-footer></app-footer>
```


<div style="page-break-after: always;"></div>


#### <u>**Code HTML & CSS final du composant navbar**</u>

##### <u>**Code HTML (fichier : `src/app/components/navbar/navbar.html`) :**</u>

Le code final épuré pour le template du composant **navbar** :

``` html
<nav class="nav-bar-fluid container-fluid  navbar navbar-expand-sm p-0 mb-4">
        
    <div class="container-xl nav-bar-content p-0">
        
        <!-- Bouton Toggle (menu hamburger) : -->
        <button class="navbar-toggler ms-3 mt-2 mb-2"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"  
                aria-expanded="false"
                aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
        </button>

            <!-- Conteneur des liens du menu -->
        <div class="collapse navbar-collapse" id="navbarNav">

            <!-- Cale la navbar sur la droite -->
            <!-- <div class="me-auto"></div> -->
            <ul class="navbar-nav nav-underline">

                <!-- Accès à la page home -->
                <li class="nav-item border-0">
                    <a  class="nav-link"
                        routerLink="home"
                        routerLinkActive="active"
                        title="Retour à la page d'accueil">
                            <i class="bi bi-house-fill"></i>
                    </a>
                </li>

                <!-- Accès à la page de calcul d'une recette SaF -->
                <li class="nav-item">
                    <a  class="nav-link"
                        routerLink="recipe-calculator"
                        routerLinkActive="active"
                        title="Calculer une recette de savon">
                            <i class="bi bi-calculator-fill"> </i>
                            Calculateur
                    </a>
                </li>

                <!-- Accès aux recettes de l'utilisateur -->
                <li class="nav-item">
                    <a  class="nav-link"
                        routerLink="recipe-manager"
                        routerLinkActive="active"
                        title="Gérer mes recettes (retrouver ,modifier, supprimer...)">
                            <i class="bi bi-journal-text"> </i>
                            Mes recettes
                    </a>
                </li>

                <!-- Accès gestion des utilisateurs pour l'administrateur  -->
                <li class="nav-item admin-only">
                    <a  class="nav-link"
                        routerLink="users-manager"
                        routerLinkActive="active"
                        title="Gérer les utilisateurs">
                            <i class="bi bi-people-fill"> </i>
                            Utilisateurs
                    </a>
                </li>

                <!-- Accès gestion des ingrédients pour l'administrateur -->
                <li class="nav-item admin-only">
                    <a  class="nav-link"
                        routerLink="ingredients-manager"
                        routerLinkActive="active"
                        title="Gérer les ingrédients (corps gras et agents alcalins)">
                            <i class="bi bi-collection-fill"> </i>
                            Ingrédients
                    </a>
                </li>
            </ul>
        </div>
    </div>
</nav>
```

<div style="page-break-after: always;"></div>


##### <u>**Code CSS (fichier : `src/app/components/navbar/navbar.css`) :**</u>

Afin d'avoir un rendu satisfaisant, nous allons ajouter du code **css** spéficique à notre composant :

``` css
    .nav-bar-fluid {        
        background: var(--dark-side-charter);
        box-shadow: 0px 20px 10px rgba(0, 0, 0, 0.2);

        .nav-bar-content {
            background: var(--dark-charter);
            border-top: 4px solid var(--green-charter);
            border-left: solid 1px var(--green-charter);
            border-right: solid 1px var(--green-charter);

            .nav-link {
                color: white;             
            }
      
            .active {
                color: var(--green-charter);            
            }
      
            .admin-only {
                background: var(--purple-charter);
            }
        }
    }

    .navbar-nav {
        gap: 0px; /* Supprime l'espace entre les éléments */
        margin: 2px;
    }
    
    .navbar-toggler {
        width: 55px;
        background-color: var(--purple-charter);
        color: white;
    }

    .nav-item {
        margin: 0px; /* Contrôle l'espace entre chaque élément */
        padding: 0px 5px 0px 5px;
        border-left: 1px solid;  
        border-color: rgb(110, 110, 110);        
    } 
```



<div style="page-break-after: always;"></div>


#### <u>**Finalisation du composant header**</u>

Nous avons pour le momement uniquement implémenter le code permettant d'insérer le composant **navbar** dans le **header**. Il est temps d'implémenter le code spécifique à notre **header**. 


##### <u>**Code CSS (fichier : `src/app/components/header/header.html`) :**</u>

Ouvrir le fichier template du composant **header** et implémenter le code final :

``` html
<header class="app-header fixed-top">

    <div class="top-bar-fluid container-fluid p-0">        
        <div class="top-bar-content container-xl p-0">
            <a  class="navbar-brand me-auto"
                routerLink="home"
                routerLinkActive="active">
                        <img    src="./logos/logo.png"
                                alt="SavApp Logo"
                                class="logo img-fluid"
                        >
            </a>
                
            <!-- Menu utilisateur : -->
            <div class="user-menu align-items-center me-3">
            
                <span class="user-name text-dark bg-light rounded-1 ps-2">
                    John DOE
                </span>

                <!-- Bouton Dropdown Bootstrap -->
                <button class="dropdown-btn rounded-pill dropdown-toggle"
                        type="button"
                        id="userDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false">
                </button>

                <!-- Contenu du menu dropdown -->
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a  class="dropdown-item"
                            routerLink="/login">Se connecter</a></li>
                    <li><a  class="dropdown-item"
                            routerLink="/account">Mon compte</a></li>
                    <li><a  class="dropdown-item"
                            routerLink="/subscribe">Créer un compte</a></li>

                    <!-- <li><hr class="dropdown-divider"></li> -->
                    <!-- <li><a  class="dropdown-item text-danger"
                            routerLink="#" (click)="logout()">Déconnexion</a></li> -->
                </ul>

            </div>
        </div>
    </div> 


    <!-- Composant navbar -->
    <app-navbar></app-navbar>

</header>
```

<div style="page-break-after: always;"></div>


##### <u>**Code CSS (fichier : `src/app/components/header/header.css`) :**</u>


Ouvrir le fichier **css** du composant **header** et implémenter le code final :

``` css
.app-header {
    .top-bar-fluid {
        height: var(--top-bar-height);
        background: var(--dark-side-charter);        
    }

    .top-bar-content {
        height: var(--top-bar-height);
        background: var(--brown-charter);
        border-left: solid 1px var(--green-charter);
        border-right: solid 1px var(--green-charter);
        display: flex;          /* Ajout pour aligner les éléments */
        align-items: center;    /* Centre verticalement les éléments */      
    }
  
    .logo {
        height: var(--top-bar-height);
    }  
    
    .user-menu {        
        display: flex;
        height: 30px;
        border-radius: 15px;
        /* align-items: center; */
        background: var(--green-charter);
        padding: 0px;        
  
        .user-name {
            min-width: 120px;
            color: white;
            margin-left: 10px;
            margin-right: 0px; 
            padding-right: 0px;
            transform: translateX(8px);          
        }
  
        .dropdown-btn {
            width: 30px;
            height: 30px;
            background: var(--purple-charter);
            border: none;
            margin-right: 0px;
            color: white;
            font-size: 20px;
            z-index: 2;                     
      }   
      
        /* Style du menu dropdown */
        .dropdown-menu {
            z-index: 1021;
            min-width: 150px;
            box-shadow: 0 8px 8px rgba(0, 0, 0, 0.3);
        }

        /* Espacement des éléments */
        .dropdown-item {
            padding: 5px 10px;
        }

        /* Style au survol */
        .dropdown-item:hover {
            background: var(--green-charter);
            color: white;
        }
    }
  }
```

<div style="page-break-after: always;"></div>


#### <u>**Ajustements sur le composant parent app**</u>

Si vous avez optez pour un header **top fixed** (fixé en haut de la page durant le scroll vertical), alors le contenu principal présenté par le router risque d'être en partie masqué par le header. Nous allons remédier à cela en appliquant une marge grâce à des élément de style css.

##### <u>**Code CSS (fichier : `src/app/app.html`) :**</u>



Ouvrir le fichier template du composant **app** et implémenter le code final :

``` html
<!-- HEADER DE L'APPLICATION -->
<app-header></app-header>

<!-- AFFICHAGE DU CONTENU ROUTE : -->
<div class="main-content container min-vh-100">
    <router-outlet></router-outlet>
</div>

<!-- FOOTER DE L'APPLICATION -->
<app-footer></app-footer>

```

##### <u>**Code CSS (fichier : `src/app/app.css`) :**</u>


Ouvrir le fichier **css** du composant **app** et implémenter le code final :

``` css
.main-content {
    margin-top: 160px;
    margin-bottom: 50px;
}
```


