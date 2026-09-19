import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-confirm-inscription-page',
    imports: [RouterLink],
    templateUrl: './confirm-inscription-page.html',
})
export class ConfirmInscriptionPage implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly authService = inject(AuthService);
    private readonly destroyRef = inject(DestroyRef);
    public etat: 'chargement' | 'succes' | 'echec' = 'chargement';
    public messageErreur = '';

    ngOnInit(): void {
        const key = this.route.snapshot.queryParamMap.get('key');
        if (!key?.trim()) {
            this.etat = 'echec';
            this.messageErreur = 'Le lien de confirmation est incomplet. Ouvrez le lien reçu dans votre email.';
            return;
        }
        this.authService.confirmInscription(key).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (response) => {
                this.etat = response?.result === 'ok' ? 'succes' : 'echec';
                this.messageErreur = 'La confirmation a échoué. Le lien peut être invalide ou expiré.';
            },
            error: () => {
                this.etat = 'echec';
                this.messageErreur = 'Impossible de confirmer votre compte. Veuillez réessayer ultérieurement en ouvrant le lien reçu par email.';
            },
        });
    }
}
