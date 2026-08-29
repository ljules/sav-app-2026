import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Utilisateur } from '../models/utilisateur.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UtilisateurService {
    // URL de base de notre API : 
    private readonly API_URL_UTILISATEUR = 'http://localhost:8080/api-savon/v1/utilisateur';

    constructor(private http: HttpClient) { }

    /** 
    * Récupère la liste de tous les ingrédients depuis le backend. 
    * @returns Un Observable contenant le tableau des ingrédients. 
    */
    getUtilisateurs(): Observable<Utilisateur[]> {
        return this.http.get<Utilisateur[]>(this.API_URL_UTILISATEUR);
    }
}
