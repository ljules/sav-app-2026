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
        estActif: true,
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

    for (const estActif of [true, false]) {
        it(`préserve estActif=${estActif} lors de la sauvegarde`, () => {
            component.profil = { ...profil, estActif };
            component.ouvrirModification();
            component.enregistrerProfil();
            expect(profilService.updateProfil).toHaveBeenCalledWith(jasmine.objectContaining({
                estActif, estBanned: false, nouveauMotDePasse: null,
            }));
        });
    }

    it('bloque la sauvegarde si le serveur ne fournit pas estActif', () => {
        component.profil = { ...profil, estActif: undefined };
        component.ouvrirModification();
        component.enregistrerProfil();
        expect(profilService.updateProfil).not.toHaveBeenCalled();
        expect(component.erreurEnregistrement).toContain('activation');
    });

    it('attend la fermeture Bootstrap avant de déconnecter', () => {
        component.ouvrirModification();
        fixture.detectChanges();
        const modal: HTMLElement = fixture.nativeElement.querySelector('#profilModal');
        modal.classList.add('show');
        const fermeture: HTMLButtonElement = modal.querySelector('button[hidden]')!;
        const click = spyOn(fermeture, 'click');
        component.enregistrerProfil();
        expect(click).toHaveBeenCalled();
        expect(authService.logout).not.toHaveBeenCalled();
        modal.classList.remove('show');
        modal.dispatchEvent(new Event('hidden.bs.modal'));
        expect(authService.logout).toHaveBeenCalledTimes(1);
        expect(component.profilEnEdition).toBeNull();
    });
});
