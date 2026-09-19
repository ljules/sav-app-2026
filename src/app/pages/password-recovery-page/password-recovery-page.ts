import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-password-recovery-page',
    imports: [FormsModule, RouterLink],
    templateUrl: './password-recovery-page.html',
})
export class PasswordRecoveryPage {
    private readonly route = inject(ActivatedRoute);
    private readonly auth = inject(AuthService);
    private readonly destroyRef = inject(DestroyRef);
    readonly reset = this.route.snapshot.data['reset'] === true;
    readonly key = this.route.snapshot.queryParamMap.get('key')?.trim() ?? '';
    email = '';
    confirmationEmail = '';
    password = '';
    confirmationPassword = '';
    code = '';
    enCours = false;
    termine = false;
    erreur = '';

    get concordance(): boolean {
        return this.reset
            ? this.password.length > 0 && this.password === this.confirmationPassword && /^\d{6}$/.test(this.code)
            : this.email.trim().length > 0 && this.email.trim() === this.confirmationEmail.trim();
    }

    envoyer(form: NgForm): void {
        if (this.enCours || this.termine || form.invalid || !this.concordance || (this.reset && !this.key)) return;
        this.enCours = true;
        this.erreur = '';
        if (!this.reset) {
            this.auth.demanderResetMotDePasse(this.email.trim()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: () => { this.enCours = false; this.termine = true; },
                error: () => {
                    this.enCours = false;
                    this.erreur = 'Impossible d’envoyer la demande. Veuillez réessayer ultérieurement.';
                },
            });
            return;
        }
        this.auth.resetMotDePasse(this.key, {
            nouveauMotDePasse: this.password,
            nouveauMotDePasseConfirmation: this.confirmationPassword,
            code: Number(this.code),
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (response) => {
                this.enCours = false;
                if (response?.result === 'ok' && !response.errors?.length) {
                    this.termine = true;
                    this.password = this.confirmationPassword = this.code = '';
                } else {
                    this.erreur = this.messageErreurs(response?.errors);
                }
            },
            error: (error) => {
                this.enCours = false;
                this.erreur = Array.isArray(error.error?.errors)
                    ? this.messageErreurs(error.error.errors)
                    : 'Impossible de renouveler le mot de passe. Veuillez réessayer ultérieurement.';
            },
        });
    }

    private messageErreurs(errors: unknown): string {
        const messages: Record<string, string> = {
            'expiration du code': 'Le code a expiré. Effectuez une nouvelle demande.',
            'les mots de passe ne correspondent pas': 'Les mots de passe ne correspondent pas.',
            'code invalide': 'Le code de confirmation est incorrect.',
            'deja utilise': 'Cette demande a déjà été utilisée. Effectuez une nouvelle demande.',
        };
        const textes = Array.isArray(errors)
            ? errors.filter((e): e is string => typeof e === 'string').map(e => messages[e] ?? e)
            : [];
        return textes.length ? textes.join(' ') : 'La réinitialisation a échoué. Vérifiez le code ou effectuez une nouvelle demande.';
    }
}
