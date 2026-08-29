import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Role, Utilisateur, UtilisateurFormDTO } from '../../models/utilisateur.model';
import { UtilisateurService } from '../../services/utilisateur.service';

type ColonneTri = 'id' | 'username' | 'email' | 'estBanned' | 'role' | 'dateCreation';
type DirectionTri = 'asc' | 'desc';

@Component({
    selector: 'app-users-manager-page',
    imports: [CommonModule, FormsModule],
    templateUrl: './users-manager-page.html',
    styleUrl: './users-manager-page.css',
})
export class UsersManagerPage implements OnInit {
    @ViewChild('fermetureModal') private boutonFermetureModal?: ElementRef<HTMLButtonElement>;

    public utilisateurs: Utilisateur[] = [];
    public roles: Role[] = [];
    public utilisateurSelectionne: UtilisateurFormDTO | null = null;
    public confirmationMotDePasse = '';
    public rechercheUtilisateur = '';
    public afficherAdministrateurs = true;
    public afficherUtilisateurs = true;
    public afficherActifs = true;
    public afficherInactifs = true;
    public colonneTri: ColonneTri | null = null;
    public directionTri: DirectionTri | null = null;
    public readonly taillePage = 10;
    public pageCourante = 1;
    public chargementEnCours = false;
    public enregistrementEnCours = false;
    public messageSucces = '';
    public erreurChargement = '';
    public erreurEnregistrement = '';

    constructor(private utilisateurService: UtilisateurService) {}

    ngOnInit(): void {
        this.chargerUtilisateurs();
        this.chargerRoles();
    }

    public chargerUtilisateurs(): void {
        this.chargementEnCours = true;
        this.erreurChargement = '';
        this.utilisateurService.getUtilisateurs().subscribe({
            next: (data) => {
                this.utilisateurs = data;
                this.chargementEnCours = false;
                this.corrigerPageCourante();
            },
            error: (err) => {
                console.error('Erreur lors du chargement des utilisateurs :', err);
                this.chargementEnCours = false;
                this.erreurChargement = "Impossible de charger les utilisateurs. Vérifiez la disponibilité de l'API.";
            },
        });
    }

    private chargerRoles(): void {
        this.utilisateurService.getRoles().subscribe({
            next: (roles) => this.roles = roles,
            error: (err) => {
                console.error('Erreur lors du chargement des rôles :', err);
                this.erreurChargement = "Impossible de charger les rôles disponibles.";
            },
        });
    }

    public get utilisateursFiltresTries(): Utilisateur[] {
        const motif = this.rechercheUtilisateur.trim().toLocaleLowerCase('fr');
        const resultat = this.utilisateurs.filter((utilisateur) => {
            const correspondRecherche = !motif ||
                utilisateur.username.toLocaleLowerCase('fr').includes(motif) ||
                utilisateur.email.toLocaleLowerCase('fr').includes(motif);
            const estAdministrateur = utilisateur.role.nomLogic === 'ROLE_ADMIN';
            const correspondRole =
                (estAdministrateur && this.afficherAdministrateurs) ||
                (!estAdministrateur && this.afficherUtilisateurs);
            const correspondStatut =
                (!utilisateur.estBanned && this.afficherActifs) ||
                (utilisateur.estBanned && this.afficherInactifs);
            return correspondRecherche && correspondRole && correspondStatut;
        });

        if (!this.colonneTri || !this.directionTri) return resultat;
        const facteur = this.directionTri === 'asc' ? 1 : -1;
        const colonne = this.colonneTri;
        return [...resultat].sort((a, b) => {
            if (colonne === 'role') {
                return a.role.nomLogic.localeCompare(b.role.nomLogic, 'fr') * facteur;
            }
            if (colonne === 'dateCreation') {
                return (new Date(a.dateCreation ?? 0).getTime() -
                    new Date(b.dateCreation ?? 0).getTime()) * facteur;
            }
            if (colonne === 'estBanned') {
                return (Number(a.estBanned) - Number(b.estBanned)) * facteur;
            }
            const valeurA = a[colonne];
            const valeurB = b[colonne];
            if (typeof valeurA === 'string' && typeof valeurB === 'string') {
                return valeurA.localeCompare(valeurB, 'fr', { sensitivity: 'base' }) * facteur;
            }
            return (Number(valeurA) - Number(valeurB)) * facteur;
        });
    }

    public get nombrePages(): number {
        return Math.max(1, Math.ceil(this.utilisateursFiltresTries.length / this.taillePage));
    }

    public get pagesDisponibles(): number[] {
        return Array.from({ length: this.nombrePages }, (_, index) => index + 1);
    }

    public get utilisateursAffiches(): Utilisateur[] {
        const debut = (this.pageCourante - 1) * this.taillePage;
        return this.utilisateursFiltresTries.slice(debut, debut + this.taillePage);
    }

    public changerTri(colonne: ColonneTri): void {
        if (this.colonneTri === colonne) {
            this.directionTri = this.directionTri === 'asc' ? 'desc' : 'asc';
        } else {
            this.colonneTri = colonne;
            this.directionTri = 'asc';
        }
        this.pageCourante = 1;
    }

    public estTriActif(colonne: ColonneTri): boolean {
        return this.colonneTri === colonne;
    }

    public symboleTri(colonne: ColonneTri): string {
        if (!this.estTriActif(colonne)) return '-';
        return this.directionTri === 'asc' ? '↑' : '↓';
    }

    public reinitialiserPage(): void {
        this.pageCourante = 1;
    }

    public allerPage(page: number): void {
        if (page >= 1 && page <= this.nombrePages) this.pageCourante = page;
    }

    private corrigerPageCourante(): void {
        this.pageCourante = Math.min(Math.max(1, this.pageCourante), this.nombrePages);
    }

    public creerNouvelUtilisateur(): void {
        const roleUtilisateur = this.roles.find((role) => role.nomLogic === 'ROLE_UTILISATEUR') ??
            this.roles[0];
        this.reinitialiserEtatModal();
        if (!roleUtilisateur) {
            this.erreurChargement = 'Aucun rôle disponible : la création est impossible.';
            return;
        }
        this.utilisateurSelectionne = {
            id: null,
            username: '',
            email: '',
            nouveauMotDePasse: '',
            estBanned: false,
            role: roleUtilisateur,
            recettes: [],
        };
    }

    public editerUtilisateur(utilisateur: Utilisateur): void {
        this.reinitialiserEtatModal();
        this.utilisateurSelectionne = {
            id: utilisateur.id,
            username: utilisateur.username,
            email: utilisateur.email,
            nouveauMotDePasse: null,
            estBanned: utilisateur.estBanned,
            role: this.roles.find((role) => role.id === utilisateur.role.id) ?? utilisateur.role,
            recettes: utilisateur.recettes ?? [],
        };
    }

    public annulerEdition(): void {
        this.utilisateurSelectionne = null;
        this.reinitialiserEtatModal();
    }

    private reinitialiserEtatModal(): void {
        this.confirmationMotDePasse = '';
        this.erreurEnregistrement = '';
        this.enregistrementEnCours = false;
    }

    public get formulaireUtilisateurValide(): boolean {
        if (!this.utilisateurSelectionne) return false;
        const utilisateur = this.utilisateurSelectionne;
        const motDePasse = utilisateur.nouveauMotDePasse ?? '';
        const motDePasseRequis = utilisateur.id === null;
        const motDePasseValide = (!motDePasseRequis && motDePasse.length === 0) ||
            (motDePasse.length > 0 && motDePasse === this.confirmationMotDePasse);
        return utilisateur.username.trim().length > 0 &&
            utilisateur.email.trim().length > 0 && !!utilisateur.role && motDePasseValide;
    }

    public saveUtilisateur(): void {
        if (!this.utilisateurSelectionne || !this.formulaireUtilisateurValide) return;
        const utilisateur = this.utilisateurSelectionne;
        const estCreation = utilisateur.id === null;
        const requete = estCreation
            ? this.utilisateurService.addUtilisateur(utilisateur)
            : this.utilisateurService.updateUtilisateur(utilisateur.id!, utilisateur);

        this.enregistrementEnCours = true;
        this.erreurEnregistrement = '';
        requete.subscribe({
            next: () => {
                this.enregistrementEnCours = false;
                this.boutonFermetureModal?.nativeElement.click();
                this.utilisateurSelectionne = null;
                this.messageSucces = estCreation
                    ? 'Utilisateur créé avec succès.'
                    : 'Utilisateur modifié avec succès.';
                this.chargerUtilisateurs();
            },
            error: (err) => {
                console.error("Erreur lors de l'enregistrement de l'utilisateur :", err);
                this.enregistrementEnCours = false;
                this.erreurEnregistrement = "L'enregistrement a échoué. Vérifiez les données saisies.";
            },
        });
    }

    public supprimerUtilisateur(utilisateur: Utilisateur): void {
        if (!confirm(`Supprimer l'utilisateur « ${utilisateur.username} » ?`)) return;
        this.messageSucces = '';
        this.utilisateurService.deleteUtilisateur(utilisateur.id).subscribe({
            next: () => {
                this.messageSucces = 'Utilisateur supprimé avec succès.';
                this.chargerUtilisateurs();
            },
            error: (err) => {
                console.error("Erreur lors de la suppression de l'utilisateur :", err);
                this.erreurChargement = "La suppression de l'utilisateur a échoué.";
            },
        });
    }
}
