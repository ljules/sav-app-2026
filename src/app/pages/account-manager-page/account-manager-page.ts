import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Utilisateur, UtilisateurFormDTO } from '../../models/utilisateur.model';
import { AuthService } from '../../services/auth.service';
import { ProfilService } from '../../services/profil.service';

@Component({
    selector: 'app-account-manager-page',
    imports: [CommonModule, FormsModule],
    templateUrl: './account-manager-page.html',
    styleUrl: './account-manager-page.css',
})
export class AccountManagerPage implements OnInit {
    @ViewChild('profilModal') private modal?: ElementRef<HTMLElement>;
    @ViewChild('fermetureApresEnregistrement') private fermeture?: ElementRef<HTMLButtonElement>;
    private deconnexionEnAttente = false;
    public profil: Utilisateur | null = null;
    public profilEnEdition: UtilisateurFormDTO | null = null;
    public confirmationMotDePasse = '';
    public chargementEnCours = false;
    public enregistrementEnCours = false;
    public erreurChargement = '';
    public erreurEnregistrement = '';

    constructor(
        public authService: AuthService,
        private profilService: ProfilService,
    ) {}

    ngOnInit(): void {
        this.chargerProfil();
    }

    public chargerProfil(): void {
        this.chargementEnCours = true;
        this.erreurChargement = '';
        this.profilService.getProfil().subscribe({
            next: (profil) => {
                this.profil = profil;
                this.chargementEnCours = false;
            },
            error: (err) => {
                console.error('Erreur lors du chargement du profil :', err);
                this.chargementEnCours = false;
                this.erreurChargement = "Impossible de charger vos informations. Vérifiez la disponibilité de l'API.";
            },
        });
    }

    public ouvrirModification(): void {
        if (!this.profil) return;
        this.profilEnEdition = {
            id: this.profil.id,
            username: this.profil.username,
            email: this.profil.email,
            nouveauMotDePasse: null,
            role: this.profil.role,
            estBanned: this.profil.estBanned,
            estActif: this.profil.estActif,
            recettes: this.profil.recettes ?? [],
        };
        this.confirmationMotDePasse = '';
        this.erreurEnregistrement = '';
    }

    public annulerModification(): void {
        this.profilEnEdition = null;
        this.confirmationMotDePasse = '';
        this.erreurEnregistrement = '';
        this.enregistrementEnCours = false;
    }

    public get formulaireValide(): boolean {
        if (!this.profilEnEdition) return false;
        const motDePasse = this.profilEnEdition.nouveauMotDePasse ?? '';
        const motDePasseValide = motDePasse.length === 0 || motDePasse === this.confirmationMotDePasse;
        return this.profilEnEdition.username.trim().length > 0 &&
            this.emailValide(this.profilEnEdition.email) && motDePasseValide;
    }

    private emailValide(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    }

    public enregistrerProfil(): void {
        if (!this.profilEnEdition || !this.formulaireValide || this.enregistrementEnCours) return;
        if (typeof this.profil?.estActif !== 'boolean') {
            this.erreurEnregistrement = 'L’état d’activation du compte est indisponible. Rechargez votre profil avant de réessayer.';
            return;
        }
        this.profilEnEdition.estActif = this.profil.estActif;
        this.enregistrementEnCours = true;
        this.erreurEnregistrement = '';
        this.profilService.updateProfil(this.profilEnEdition).subscribe({
            next: () => {
                this.deconnexionEnAttente = true;
                const modal = this.modal?.nativeElement;
                if (modal && (modal.classList.contains('show') || modal.style.display === 'block')) {
                    // Bootstrap retire le fond bloquant avant d'émettre hidden.bs.modal.
                    this.fermeture?.nativeElement.click();
                } else {
                    this.apresFermetureModal();
                }
            },
            error: (err) => {
                console.error('Erreur lors de la modification du profil :', err);
                this.enregistrementEnCours = false;
                this.erreurEnregistrement = 'La mise à jour a échoué. Vérifiez les informations saisies.';
            },
        });
    }

    public apresFermetureModal(): void {
        if (!this.deconnexionEnAttente) return;
        this.deconnexionEnAttente = false;
        this.annulerModification();
        this.authService.logout(
            'Votre profil a été mis à jour. Veuillez vous reconnecter avec vos nouvelles informations.',
        );
    }
}
