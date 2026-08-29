import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Ingredient } from '../../models/ingredient.model';
import { IngredientService } from '../../services/ingredient.service';
import { FormsModule } from '@angular/forms'

type CleCaracteristique = 'sapo' | 'ins' | 'iode' | 'lavant' | 'douceur' |
    'durete' | 'solubilite' | 'sechage' | 'volMousse' | 'tenueMousse';
type CleTri = keyof Ingredient;
type DirectionTri = 'asc' | 'desc';

@Component({
  selector: 'app-ingredients-manager-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './ingredients-manager-page.html',
  styleUrl: './ingredients-manager-page.css',
})

export class IngredientsManagerPage implements OnInit {
    // Déclaration du tableau de stockage des ingrédients
    public ingredients: Ingredient[] = [];

    // Objet temporaire/brouillon pour ajout/modification :
    public ingredientSelectionne: Ingredient | null = null;

    // Copie de référence de l'ingrédient avant modification
    public ingredientInitial: Ingredient | null = null;

    // Sélecteur affichage corps gras :
    public afficherCorpsGras = true;

    // Sélecteur affichage adjuvants :
    public afficherAdjuvants = true;

    // Recherche, filtre numérique, tri et pagination :
    public rechercheNom = '';
    public caracteristiqueFiltre: CleCaracteristique = 'sapo';
    public valeurMin: number | null = null;
    public valeurMax: number | null = null;
    public filtreNumeriqueActif = false;
    public colonneTri: CleTri | null = null;
    public directionTri: DirectionTri | null = null;
    public readonly taillePage = 10;
    public pageCourante = 1;

    public readonly caracteristiquesFiltrables: Array<{
        cle: CleCaracteristique;
        libelle: string;
    }> = [
        { cle: 'sapo', libelle: 'Indice de saponification (SAP)' },
        { cle: 'ins', libelle: 'Indice INS' },
        { cle: 'iode', libelle: "Indice d'iode" },
        { cle: 'lavant', libelle: 'Pouvoir lavant' },
        { cle: 'douceur', libelle: 'Douceur' },
        { cle: 'durete', libelle: 'Dureté' },
        { cle: 'solubilite', libelle: 'Solubilité' },
        { cle: 'sechage', libelle: 'Séchage' },
        { cle: 'volMousse', libelle: 'Volume de mousse' },
        { cle: 'tenueMousse', libelle: 'Tenue de mousse' },
    ];

    // Attributs pour l'import CSV :
    public fichierCsvSelectionne: File | null = null;
    public messageImport: string = '';
    public erreurImport: string = '';
    public importEnCours: boolean = false;


    // Injection du service :
    constructor(private ingredientService: IngredientService) {}

    // Méthode d'initialisation du composant :
    ngOnInit(): void {
        this.getIngredients();
    }

    /***
     * Méthode d'appel du service pour récupérer les données par l'API
     */
    getIngredients(): void {
        this.ingredientService.getIngredients().subscribe({
            next: (data) =>{
                this.ingredients = data;
                this.corrigerPageCourante();
                console.log("Ingrédients récupérés avec succès !")
            },
            error: (err) =>{
                console.error("Erreur API : ", err);
            } 
        });
    }

    /**
     * Prépare l'ajout d'un nouvel ingredient (ligne vide)
     */
    creerNouvelIngredient(): void {
        this.ingredientInitial = null; // Pas de comparaison en mode création
        this.ingredientSelectionne = {
            id: 0, nom: '',
            sapo: 0,
            ins: 0,
            iode: 0,  
            volMousse: 0,
            tenueMousse: 0,
            douceur: 0,  
            lavant: 0,
            durete: 0,
            solubilite: 0,
            sechage: 0,  
            estCorpsGras: true
        };
    }

    /**
     * Lance l'édition d'une ligne existante
     */
    editerIngredient(item: Ingredient): void {
        // copie de référence = état initial
        this.ingredientInitial = { ...item };

        // Création de la copie de travail (brouillon) pour appliquer les modifcations seulement après validation
        this.ingredientSelectionne = {...item };
    }


    annulerEdition(): void {
        this.ingredientSelectionne = null;
        this.ingredientInitial = null;
    }

    estChampModifie(cle: keyof Ingredient): boolean {
        if (!this.ingredientSelectionne || !this.ingredientInitial) {
            return false;
        }

        return this.ingredientSelectionne[cle] !== this.ingredientInitial[cle];
    }



    /**
     * Enregistrer (Ajout si id = 0 ou update si id != 0)
     */
    saveIngredient(): void {
        if (!this.ingredientSelectionne) return; // Ne rien faire si pas d'ingrédient sélectionné
        const action = this.ingredientSelectionne.id === 0
            // Cas où id = 0 -> On ajoute le nouvel ingredient
            ? this.ingredientService.addIngredient(this.ingredientSelectionne)
            // Cas où id != 0 -> On met à jour l'ingredient existant
            : this.ingredientService.updateIngredient(this.ingredientSelectionne);

        // Rafraichissement de la présentation avec le nouvel état (ajout ou mise à jour):
        action.subscribe({
            next: () => {
                // On remet à null la sélection courante d'un ingrédient :
                this.ingredientSelectionne = null;
                // On remet à null la copie initial de l'ingrédient en modificaiton :
                this.ingredientInitial = null;
                // On récupère de nouveau la liste d'ingrédients pour la rafraîchir :
                this.getIngredients();
            }
        });
    }

    /**
     * Supprime un ingredient à partir de son id
     */
    deleteIngredient(id: number): void {
        if (confirm("Supprimer cet ingrédient ?")) {
            this.ingredientService.deleteIngredient(id).subscribe(
                () => this.getIngredients()
                );
        }
    }

    public get plageNumeriqueInvalide(): boolean {
        return this.valeurMin !== null && this.valeurMax !== null &&
            this.valeurMin > this.valeurMax;
    }

    public get ingredientsFiltresTries(): Ingredient[] {
        const motif = this.rechercheNom.trim().toLocaleLowerCase('fr');

        const ingredientsFiltres = this.ingredients.filter((ingredient) => {
            const correspondAuNom = !motif ||
                ingredient.nom.toLocaleLowerCase('fr').includes(motif);
            const correspondAuType =
                (ingredient.estCorpsGras && this.afficherCorpsGras) ||
                (!ingredient.estCorpsGras && this.afficherAdjuvants);

            if (!correspondAuNom || !correspondAuType) return false;
            if (!this.filtreNumeriqueActif) return true;

            // Le filtre par caractéristique concerne uniquement les corps gras.
            if (!ingredient.estCorpsGras || this.plageNumeriqueInvalide) return false;

            const valeur = ingredient[this.caracteristiqueFiltre];
            const respecteMinimum = this.valeurMin === null || valeur >= this.valeurMin;
            const respecteMaximum = this.valeurMax === null || valeur <= this.valeurMax;
            return respecteMinimum && respecteMaximum;
        });

        if (!this.colonneTri || !this.directionTri) return ingredientsFiltres;

        const facteur = this.directionTri === 'asc' ? 1 : -1;
        const colonne = this.colonneTri;
        return [...ingredientsFiltres].sort((a, b) => {
            const valeurA = a[colonne];
            const valeurB = b[colonne];

            if (typeof valeurA === 'string' && typeof valeurB === 'string') {
                return valeurA.localeCompare(valeurB, 'fr', { sensitivity: 'base' }) * facteur;
            }
            if (typeof valeurA === 'boolean' && typeof valeurB === 'boolean') {
                return (Number(valeurA) - Number(valeurB)) * facteur;
            }
            return (Number(valeurA) - Number(valeurB)) * facteur;
        });
    }

    public get nombrePages(): number {
        return Math.max(1, Math.ceil(this.ingredientsFiltresTries.length / this.taillePage));
    }

    public get pagesDisponibles(): number[] {
        return Array.from({ length: this.nombrePages }, (_, index) => index + 1);
    }

    public get ingredientsAffiches(): Ingredient[] {
        const debut = (this.pageCourante - 1) * this.taillePage;
        return this.ingredientsFiltresTries.slice(debut, debut + this.taillePage);
    }

    public changerTri(colonne: CleTri): void {
        if (this.colonneTri === colonne) {
            this.directionTri = this.directionTri === 'asc' ? 'desc' : 'asc';
        } else {
            this.colonneTri = colonne;
            this.directionTri = 'asc';
        }
        this.pageCourante = 1;
    }

    public estTriActif(colonne: CleTri): boolean {
        return this.colonneTri === colonne;
    }

    public symboleTri(colonne: CleTri): string {
        if (!this.estTriActif(colonne)) return '-';
        return this.directionTri === 'asc' ? '↑' : '↓';
    }

    public reinitialiserPage(): void {
        this.pageCourante = 1;
    }

    public basculerFiltreNumerique(): void {
        if (!this.filtreNumeriqueActif && this.plageNumeriqueInvalide) return;
        this.filtreNumeriqueActif = !this.filtreNumeriqueActif;
        this.pageCourante = 1;
    }

    public allerPage(page: number): void {
        if (page >= 1 && page <= this.nombrePages) this.pageCourante = page;
    }

    private corrigerPageCourante(): void {
        this.pageCourante = Math.min(Math.max(1, this.pageCourante), this.nombrePages);
    }



   /**
   * Capture du fichier sélectionné
   */
    onCsvFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;

        this.messageImport = '';
        this.erreurImport = '';

        if (!file) {
        this.fichierCsvSelectionne = null;
        return;
        }

        if (!file.name.toLowerCase().endsWith('.csv')) {
        this.erreurImport = 'Veuillez sélectionner un fichier CSV.';
        this.fichierCsvSelectionne = null;
        return;
        }

        this.fichierCsvSelectionne = file;
    }

    /**
     * Lance l'import du CSV
     */
    importerIngredientsDepuisCsv(): void {
        if (!this.fichierCsvSelectionne) {
        this.erreurImport = 'Aucun fichier CSV sélectionné.';
        return;
        }

        this.messageImport = '';
        this.erreurImport = '';
        this.importEnCours = true;

        const reader = new FileReader();

        reader.onload = () => {
        try {
            const contenu = reader.result as string;
            const ingredientsAImporter = this.parseCsvToIngredients(contenu);

            if (ingredientsAImporter.length === 0) {
            this.erreurImport = 'Le fichier CSV ne contient aucun ingrédient exploitable.';
            this.importEnCours = false;
            return;
            }

            this.importerLigneParLigne(ingredientsAImporter, 0, 0);
        } catch (error) {
            console.error(error);
            this.erreurImport = 'Erreur lors de la lecture ou de l’analyse du fichier CSV.';
            this.importEnCours = false;
        }
        };

        reader.onerror = () => {
        this.erreurImport = 'Erreur lors de la lecture du fichier.';
        this.importEnCours = false;
        };

        reader.readAsText(this.fichierCsvSelectionne, 'utf-8');
    }

    /**
     * Parse le contenu CSV selon le format de votre fichier de test
     */
    private parseCsvToIngredients(csvContent: string): Ingredient[] {
        const lignes = csvContent
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);

        if (lignes.length < 2) {
        return [];
        }

        // On ignore l'en-tête
        const dataLines = lignes.slice(1);

        return dataLines.map((ligne, index) => {
        const colonnes = ligne.split(',');

        if (colonnes.length < 13) {
            throw new Error(`Ligne CSV invalide à la ligne ${index + 2}`);
        }

        return {
            id: 0, // on laisse l'API créer l'id
            nom: colonnes[1]?.trim() ?? '',
            iode: this.toNumber(colonnes[2]),
            ins: this.toNumber(colonnes[3]),
            sapo: this.toNumber(colonnes[4]),
            volMousse: this.toNumber(colonnes[5]),
            tenueMousse: this.toNumber(colonnes[6]),
            douceur: this.toNumber(colonnes[7]),
            lavant: this.toNumber(colonnes[8]),
            durete: this.toNumber(colonnes[9]),
            solubilite: this.toNumber(colonnes[10]),
            sechage: this.toNumber(colonnes[11]),
            estCorpsGras: this.toBoolean(colonnes[12]),
        };
        });
    }

    private toNumber(value: string | undefined): number {
        if (!value) return 0;
        const normalized = value.trim().replace(',', '.');
        const result = Number(normalized);
        return Number.isNaN(result) ? 0 : result;
    }

    private toBoolean(value: string | undefined): boolean {
        if (!value) return false;
        const normalized = value.trim().toLowerCase();
        return normalized === 'true' || normalized === 'vrai' || normalized === '1';
    }

    /**
     * Import séquentiel pour éviter de lancer 20 requêtes d'un coup sans contrôle
     */
    private importerLigneParLigne(
        ingredients: Ingredient[],
        index: number,
        succes: number
    ): void {
        if (index >= ingredients.length) {
        this.importEnCours = false;
        this.messageImport = `${succes} ingrédient(s) importé(s) avec succès.`;
        this.fichierCsvSelectionne = null;
        this.getIngredients();
        return;
        }

        this.ingredientService.addIngredient(ingredients[index]).subscribe({
        next: () => {
            this.importerLigneParLigne(ingredients, index + 1, succes + 1);
        },
        error: (err) => {
            console.error(`Erreur import ligne ${index + 1}`, err);
            this.importEnCours = false;
            this.erreurImport = `Erreur pendant l'import à la ligne ${index + 2}.`;
        }
        });
    }


    exporterIngredientsVersCsv(): void {
        if (!this.ingredients || this.ingredients.length === 0) {
            return;
        }

        const csvContent = this.buildIngredientsCsv(this.ingredients);
        const blob = new Blob(
            ['\uFEFF' + csvContent],
            { type: 'text/csv;charset=utf-8;' }
        );

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = this.buildExportFileName();
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
    }

    private buildIngredientsCsv(ingredients: Ingredient[]): string {
        const header = [
            'ID',
            'Nom',
            'Indice Iode',
            'Indice INS',
            'Indice de Saponification',
            'Volume de Mousse',
            'Tenue de Mousse',
            'Douceur',
            'Pouvoir Lavant',
            'Dureté',
            'Solubilité',
            'Séchage',
            'Est Corps Gras'
        ];

        const lignes = ingredients.map(ingredient => [
            ingredient.id,
            this.escapeCsvValue(ingredient.nom),
            this.formatCsvNumber(ingredient.iode),
            this.formatCsvNumber(ingredient.ins),
            this.formatCsvNumber(ingredient.sapo),
            this.formatCsvNumber(ingredient.volMousse),
            this.formatCsvNumber(ingredient.tenueMousse),
            this.formatCsvNumber(ingredient.douceur),
            this.formatCsvNumber(ingredient.lavant),
            this.formatCsvNumber(ingredient.durete),
            this.formatCsvNumber(ingredient.solubilite),
            this.formatCsvNumber(ingredient.sechage),
            ingredient.estCorpsGras ? 'True' : 'False'
        ]);

        return [
            header.join(','),
            ...lignes.map(ligne => ligne.join(','))
        ].join('\r\n');
    }

    private buildExportFileName(): string {
        const maintenant = new Date();
        const yyyy = maintenant.getFullYear();
        const mm = String(maintenant.getMonth() + 1).padStart(2, '0');
        const dd = String(maintenant.getDate()).padStart(2, '0');

        return `ingredients_export_${yyyy}-${mm}-${dd}.csv`;
    }

    private escapeCsvValue(value: string | undefined | null): string {
        const texte = (value ?? '').toString();

        if (
            texte.includes(',') ||
            texte.includes('"') ||
            texte.includes('\n') ||
            texte.includes('\r')
        ) {
            return `"${texte.replace(/"/g, '""')}"`;
        }

        return texte;
    }

    private formatCsvNumber(value: number | undefined | null): string {
        if (value === null || value === undefined || Number.isNaN(value)) {
            return '0';
        }
        return String(value);
    }
     
}



