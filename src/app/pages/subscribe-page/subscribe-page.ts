import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
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

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    onSubmit(): void {
        this.errorMessage = null; // Réinitialisation du message
        console.log(`Objet userInfo transmis : 
            username: ${this.userInfo.username}
            email : ${this.userInfo.email}
            mot de passe : ${this.userInfo.password}`);
        this.authService.subscribe(this.userInfo).subscribe({
            next: () => {
                // Redirection vers la page du calculateur :
                this.router.navigate(['/recipe-calculator']);
            },
            error: (err) => {
                this.errorMessage="Erreur durant la création du compte"
            }
        });
    }
}
