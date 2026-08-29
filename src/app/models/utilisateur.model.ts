import { Recette } from "./recette.model";

export interface Role {
    id: number;
    nom: string;
    nomLogic: string;
    utilisateurs?: Utilisateur[];
}

export interface Utilisateur {
    id: number;
    username: string;
    email: string;
    nouveauMotDePasse: string | null;
    estBanned: boolean;
    role: Role;
    recettes: Recette[] | null;
    dateCreation?: string;
}

export interface UtilisateurFormDTO {
    id: number | null;
    username: string;
    email: string;
    nouveauMotDePasse: string | null;
    estBanned: boolean;
    role: Role;
    recettes: Recette[] | null;
}
