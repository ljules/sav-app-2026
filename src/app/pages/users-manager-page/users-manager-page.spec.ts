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
            estActif: true,
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
            estActif: false,
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

    it('filtre activation et bannissement indépendamment', () => {
        component.afficherNonActives = false;
        expect(component.utilisateursFiltresTries.map(u => u.username)).toEqual(['Zoé']);
        component.afficherInactifs = false;
        expect(component.utilisateursFiltresTries).toEqual([]);
        component.afficherNonActives = true;
        component.afficherActives = false;
        expect(component.utilisateursFiltresTries.map(u => u.username)).toEqual(['Admin']);
    });

    it('trie les comptes par activation dans les deux sens', () => {
        component.changerTri('estActif');
        expect(component.utilisateursFiltresTries.map(u => u.username)).toEqual(['Admin', 'Zoé']);
        component.changerTri('estActif');
        expect(component.utilisateursFiltresTries.map(u => u.username)).toEqual(['Zoé', 'Admin']);
    });

    it('réinitialise la pagination au changement du filtre activation', async () => {
        component.pageCourante = 2;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('#toggleActivated');
        input.click();
        await fixture.whenStable();
        expect(component.pageCourante).toBe(1);
        expect(component.utilisateursAffiches.map(u => u.username)).toEqual(['Admin']);
    });

    for (const estActif of [true, false]) {
        it(`enregistre estActif=${estActif} sans modifier le bannissement ni le mot de passe`, async () => {
            const original = { ...utilisateurs[0], estActif: !estActif, recettes: null };
            component.editerUtilisateur(original);
            fixture.detectChanges();
            await fixture.whenStable();
            const input: HTMLInputElement = fixture.nativeElement.querySelector('#modalEstActif');
            input.click();
            await fixture.whenStable();
            const attendu = { ...component.utilisateurSelectionne!, estActif };
            service.updateUtilisateur.and.returnValue(of({ ...original, estActif }));
            component.saveUtilisateur();
            expect(service.updateUtilisateur).toHaveBeenCalledOnceWith(original.id, attendu);
            expect(attendu.estBanned).toBeTrue();
            expect(attendu.nouveauMotDePasse).toBeNull();
            expect(attendu.recettes).toBeNull();
            expect(original.estActif).toBe(!estActif);
        });
    }

    it('initialise un nouvel utilisateur avec le rôle utilisateur', () => {
        component.creerNouvelUtilisateur();
        expect(component.utilisateurSelectionne?.role.nomLogic).toBe('ROLE_UTILISATEUR');
        expect(component.utilisateurSelectionne?.estBanned).toBeFalse();
    });
});
