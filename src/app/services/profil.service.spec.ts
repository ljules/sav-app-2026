import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Utilisateur, UtilisateurFormDTO } from '../models/utilisateur.model';
import { ProfilService } from './profil.service';

describe('ProfilService', () => {
    let service: ProfilService;
    let httpTesting: HttpTestingController;
    const url = 'http://localhost:8080/api-savon/v1/profil';
    const role = { id: 2, nom: 'Utilisateur', nomLogic: 'ROLE_UTILISATEUR' };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ProfilService, provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(ProfilService);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it('récupère le profil connecté', () => {
        const profil: Utilisateur = {
            id: 4, username: 'bruno', email: 'bruno@example.fr', nouveauMotDePasse: null,
            role, estBanned: false, recettes: [],
        };
        service.getProfil().subscribe((resultat) => expect(resultat).toEqual(profil));
        const requete = httpTesting.expectOne(url);
        expect(requete.request.method).toBe('GET');
        requete.flush(profil);
    });

    it('met à jour le profil connecté', () => {
        const formulaire: UtilisateurFormDTO = {
            id: 4, username: 'nouveau', email: 'nouveau@example.fr', nouveauMotDePasse: null,
            role, estBanned: false, recettes: [],
        };
        service.updateProfil(formulaire).subscribe();
        const requete = httpTesting.expectOne(url);
        expect(requete.request.method).toBe('PUT');
        expect(requete.request.body).toEqual(formulaire);
        requete.flush({ ...formulaire, id: 4 });
    });
});
