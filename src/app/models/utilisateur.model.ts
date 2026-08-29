import { Recette } from "./recette.model";

export interface Role {
    id: number;
    nom: string;
    nomLogic: String;
    utilisateurs: Utilisateur[]
}

export interface Utilisateur {
    id: number;
    username: string;
    email: string;
    password: string;
    estBanned: boolean;
    role: Role;
    recettes: Recette[];
    dateCreation: Date;
}