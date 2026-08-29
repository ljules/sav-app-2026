import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Role, Utilisateur } from '../../models/utilisateur.model';
import { UtilisateurService } from '../../services/utilisateur.service';
import { UsersManagerPage } from './users-manager-page';

describe('UsersManagerPage', () => {
    let component: UsersManagerPage;
    let fixture: ComponentFixture<UsersManagerPage>;
    let service: jasmine.SpyObj<UtilisateurService>;

    const roleAdmin: Role = { id: 1, nom: 'Administrateur', nomLogic: 'ROLE_ADMIN' };
    const roleUtilisateur: Role = { id: 2, nom: 'Utilisateur', nomLogic: 'ROLE_UTILISATEUR' };
    const utilisateurs: Utilisateur[] = [
        {
            id: 2,
            username: 'Zoé',
            email: 'zoe@example.fr',
            nouveauMotDePasse: null,
            estBanned: true,
            role: roleUtilisateur,
            recettes: [],
            dateCreation: '2026-02-01T10:00:00',
        },
        {
            id: 1,
            username: 'Admin',
            email: 'admin@example.fr',
            nouveauMotDePasse: null,
            estBanned: false,
            role: roleAdmin,
            recettes: [],
            dateCreation: '2026-01-01T10:00:00',
        },
    ];

    beforeEach(async () => {
        service = jasmine.createSpyObj<UtilisateurService>('UtilisateurService', [
            'getUtilisateurs', 'getRoles', 'addUtilisateur', 'updateUtilisateur', 'deleteUtilisateur',
        ]);
        service.getUtilisateurs.and.returnValue(of(utilisateurs));
        service.getRoles.and.returnValue(of([roleAdmin, roleUtilisateur]));

        await TestBed.configureTestingModule({
            imports: [UsersManagerPage],
            providers: [{ provide: UtilisateurService, useValue: service }],
        }).compileComponents();

        fixture = TestBed.createComponent(UsersManagerPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('recherche sur le nom et l’adresse e-mail sans tenir compte de la casse', () => {
        component.rechercheUtilisateur = 'ADMIN@';
        expect(component.utilisateursFiltresTries.map((u) => u.username)).toEqual(['Admin']);
    });

    it('combine les filtres de rôle et de statut', () => {
        component.afficherAdministrateurs = false;
        component.afficherActifs = false;
        expect(component.utilisateursFiltresTries.map((u) => u.username)).toEqual(['Zoé']);
    });

    it('alterne le tri croissant et décroissant', () => {
        component.changerTri('username');
        expect(component.utilisateursFiltresTries.map((u) => u.username)).toEqual(['Admin', 'Zoé']);
        component.changerTri('username');
        expect(component.utilisateursFiltresTries.map((u) => u.username)).toEqual(['Zoé', 'Admin']);
    });

    it('initialise un nouvel utilisateur avec le rôle utilisateur', () => {
        component.creerNouvelUtilisateur();
        expect(component.utilisateurSelectionne?.role.nomLogic).toBe('ROLE_UTILISATEUR');
        expect(component.utilisateurSelectionne?.estBanned).toBeFalse();
    });
});
