import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Utilisateur, UtilisateurFormDTO } from '../models/utilisateur.model';

@Injectable({ providedIn: 'root' })
export class ProfilService {
    private readonly API_URL_PROFIL = 'http://localhost:8080/api-savon/v1/profil';

    constructor(private http: HttpClient) {}

    getProfil(): Observable<Utilisateur> {
        return this.http.get<Utilisateur>(this.API_URL_PROFIL);
    }

    updateProfil(profil: UtilisateurFormDTO): Observable<Utilisateur> {
        return this.http.put<Utilisateur>(this.API_URL_PROFIL, profil);
    }
}
