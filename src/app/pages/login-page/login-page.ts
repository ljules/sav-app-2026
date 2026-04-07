import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
    // Modèle pour le formulaire :
    public credentials = { identifier: '', password: ''};

    // Gestion de l'affichage de l'erreur :
    public errorMessage: string | null = null;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    onSubmit(): void {
        
        this.errorMessage = null; // Réinitialisation du message
        this.authService.login(this.credentials).subscribe({
            next: () => {
                // Redirection vers la page de gestion ou le calculateur :
                this.router.navigate(['/recipe-manager']);                
            },
            error: (err) => {
                this.errorMessage ="Identifiants invalides ou serveur indisponible.";
                //console.log('Indentifiants envoyés :', this.credentials)
                //console.error('Erreur de connexion', err);
            }
        });
    }
}
