import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Utilisateur } from '../../models/utilisateur.model';
import { AuthService } from '../../services/auth.service';
import { ProfilService } from '../../services/profil.service';
import { AccountManagerPage } from './account-manager-page';

describe('AccountManagerPage', () => {
    let component: AccountManagerPage;
    let fixture: ComponentFixture<AccountManagerPage>;
    let profilService: jasmine.SpyObj<ProfilService>;
    let authService: jasmine.SpyObj<AuthService>;

    const profil: Utilisateur = {
        id: 4,
        username: 'bruno',
        email: 'bruno@example.fr',
        nouveauMotDePasse: null,
        role: { id: 2, nom: 'Utilisateur', nomLogic: 'ROLE_UTILISATEUR' },
        estBanned: false,
        recettes: [],
    };

    beforeEach(async () => {
        profilService = jasmine.createSpyObj<ProfilService>('ProfilService', ['getProfil', 'updateProfil']);
        authService = jasmine.createSpyObj<AuthService>('AuthService', ['getUserFullInfo', 'logout']);
        profilService.getProfil.and.returnValue(of(profil));
        profilService.updateProfil.and.returnValue(of(profil));
        authService.getUserFullInfo.and.returnValue(null);

        await TestBed.configureTestingModule({
            imports: [AccountManagerPage],
            providers: [
                { provide: ProfilService, useValue: profilService },
                { provide: AuthService, useValue: authService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AccountManagerPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('charge et affiche le profil', () => {
        expect(profilService.getProfil).toHaveBeenCalled();
        expect(component.profil?.email).toBe('bruno@example.fr');
    });

    it('travaille sur une copie lors de la modification', () => {
        component.ouvrirModification();
        component.profilEnEdition!.username = 'nouveau';
        expect(component.profil?.username).toBe('bruno');
    });

    it('refuse deux mots de passe différents', () => {
        component.ouvrirModification();
        component.profilEnEdition!.nouveauMotDePasse = 'secret';
        component.confirmationMotDePasse = 'different';
        expect(component.formulaireValide).toBeFalse();
    });

    it('déconnecte après une mise à jour réussie', () => {
        component.ouvrirModification();
        component.enregistrerProfil();
        expect(profilService.updateProfil).toHaveBeenCalled();
        expect(authService.logout).toHaveBeenCalled();
    });
});
