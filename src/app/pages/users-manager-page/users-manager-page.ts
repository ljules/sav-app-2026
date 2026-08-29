import { Component } from '@angular/core';
import { Utilisateur } from '../../models/utilisateur.model';
import { UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-users-manager-page',
  imports: [],
  templateUrl: './users-manager-page.html',
  styleUrl: './users-manager-page.css',
})
export class UsersManagerPage {

        // Déclaration du tableau de stockage des utilisateur :
        public utilisateurs: Utilisateur[] = [];  
  
        // Injection du service :
        constructor(private utilisateurService: UtilisateurService) {}
    
        // Méthode d'initialisation du composant :
        ngOnInit(): void {
            this.getIngredients();
        }
    
        /***
         * Méthode d'appel du service pour récupérer les données par l'API
         */
        getIngredients(): void {
            this.utilisateurService.getUtilisateurs().subscribe({
                next: (data) =>{
                    this.utilisateurs = data;
                    //console.log("Utilisateurs récupérés avec succès !")
                },
                error: (err) =>{
                    console.error("Erreur API : ", err);
                } 
            });
        }

}
