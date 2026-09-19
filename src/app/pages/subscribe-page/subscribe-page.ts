import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subscribe-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './subscribe-page.html',
  styleUrl: './subscribe-page.css',
})
export class SubscribePage {

    // Données à récupérer pour transmission à l'API :
    public userInfo = {
                        username: '',
                        email: '',
                        password: ''
                    };

    public doubleInputPwd = ""; // Pour confirmer le mot de passe par double saisie

    // Message de signalement d'erreur :
    public errorMessage: string | null = null;
    public inscriptionEnvoyee = false;
    public envoiEnCours = false;

    constructor(
        private authService: AuthService
    ) {}

    onSubmit(): void {
        if (this.envoiEnCours || this.inscriptionEnvoyee) return;
        this.errorMessage = null;
        if (!this.userInfo.username.trim() || !this.userInfo.email.trim() ||
            !this.userInfo.password || this.userInfo.password !== this.doubleInputPwd) {
            this.errorMessage = 'Complétez les champs et vérifiez la confirmation du mot de passe.';
            return;
        }
        this.envoiEnCours = true;
        this.authService.subscribe(this.userInfo).subscribe({
            next: () => {
                this.envoiEnCours = false;
                this.inscriptionEnvoyee = true;
                this.userInfo.password = '';
                this.doubleInputPwd = '';
            },
            error: () => {
                this.envoiEnCours = false;
                this.errorMessage = 'La création du compte a échoué. Vérifiez vos informations et réessayez.';
            }
        });
    }
}
