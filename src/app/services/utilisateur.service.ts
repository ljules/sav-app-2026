import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role, Utilisateur, UtilisateurFormDTO } from '../models/utilisateur.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UtilisateurService {
    // URL de base de notre API : 
    private readonly API_URL_UTILISATEUR = 'http://localhost:8080/api-savon/v1/utilisateur';
    private readonly API_URL_ROLE = 'http://localhost:8080/api-savon/v1/role';

    constructor(private http: HttpClient) { }

    /** 
    * Récupère la liste de tous les ingrédients depuis le backend. 
    * @returns Un Observable contenant le tableau des ingrédients. 
    */
    getUtilisateurs(): Observable<Utilisateur[]> {
        return this.http.get<Utilisateur[]>(this.API_URL_UTILISATEUR);
    }

    getUtilisateurById(id: number): Observable<Utilisateur> {
        return this.http.get<Utilisateur>(`${this.API_URL_UTILISATEUR}/${id}`);
    }

    addUtilisateur(utilisateur: UtilisateurFormDTO): Observable<Utilisateur> {
        return this.http.post<Utilisateur>(this.API_URL_UTILISATEUR, utilisateur);
    }

    updateUtilisateur(id: number, utilisateur: UtilisateurFormDTO): Observable<Utilisateur> {
        return this.http.put<Utilisateur>(`${this.API_URL_UTILISATEUR}/${id}`, utilisateur);
    }

    deleteUtilisateur(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL_UTILISATEUR}/${id}`);
    }

    getRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(this.API_URL_ROLE);
    }
}
