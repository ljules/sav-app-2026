import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RecipeExchange } from './recipe-exchange';
import { RecetteService } from '../../services/recette.service';
import { IngredientService } from '../../services/ingredient.service';
import { ProfilService } from '../../services/profil.service';
import { Recette } from '../../models/recette.model';
import { RecetteEchange, lireFichierRecettes, validerRecette, exporterRecette, recettesIdentiques } from '../../models/recette-echange';

describe('Import et export de recettes', () => {
  let component: RecipeExchange;
  let api: jasmine.SpyObj<RecetteService>;
  let choice: jasmine.Spy;
  const entry = (extra = {}): RecetteEchange => ({ titre: 'Olive', description: '', surgraissage: 5,
    avecSoude: true, concentrationAlcalin: 90, ligneIngredients: [{ ingredientId: 1, quantite: 500 }], ...extra });
  const saved = (id = 10): Recette => ({ ...entry(), id, apportEnEau: 0, qteAlcalin: 0,
    resultats: [], dateCreation: new Date(), ligneIngredients: [{ quantite: 500, pourcentage: 100,
    ingredient: { id: 1, nom: 'Olive' } as any }] });
  const run = async (recipes: unknown[], version = '1.0.0') => {
    component.file = { text: async () => JSON.stringify({ format: 'sav-app-recettes', version, recettes: recipes }) } as File;
    await component.import();
  };
  beforeEach(() => {
    api = jasmine.createSpyObj('RecetteService', ['getRecettes','createRecette','updateRecette']);
    api.getRecettes.and.returnValue(of([saved()]));
    api.createRecette.and.returnValue(of(saved(20)));
    api.updateRecette.and.returnValue(of(saved()));
    TestBed.configureTestingModule({ imports: [RecipeExchange], providers: [
      { provide: RecetteService, useValue: api },
      { provide: IngredientService, useValue: { getIngredients: () => of([{ id: 1, nom: 'Olive' }]) } },
      { provide: ProfilService, useValue: { getProfil: () => of({ id: 42 }) } },
    ] });
    component = TestBed.createComponent(RecipeExchange).componentInstance;
    choice = spyOn(component, 'askConflict').and.resolveTo('replace');
  });
  it('crée sans transmettre les identifiants et recalcule les pourcentages', async () => {
    await run([entry({ id: 10, utilisateurId: 99 })]);
    expect(api.updateRecette).not.toHaveBeenCalled();
    const dto = api.createRecette.calls.mostRecent().args[0];
    expect(dto.id).toBeUndefined();
    expect((dto as any).utilisateurId).toBeUndefined();
    expect(dto.ligneIngredients[0].pourcentage).toBe(100);
  });
  it('ignore une version identique appartenant au compte connecté', async () => {
    await run([entry({ id: 10, utilisateurId: 42 })]);
    expect(api.createRecette).not.toHaveBeenCalled();
    expect(api.updateRecette).not.toHaveBeenCalled();
    expect(choice).not.toHaveBeenCalled();
  });
  it('recrée une recette supprimée sans imposer sa clé primaire', async () => {
    await run([entry({ id: 123, utilisateurId: 42 })]);
    expect(api.createRecette).toHaveBeenCalled();
    expect(api.createRecette.calls.mostRecent().args[0].id).toBeUndefined();
  });
  it('remplace la version en conflit sur décision explicite', async () => {
    await run([entry({ id: 10, utilisateurId: 42, titre: 'Modifiée' })]);
    expect(choice).toHaveBeenCalled();
    expect(api.updateRecette.calls.mostRecent().args[0]).toBe(10);
  });
  it('passe un conflit sans modifier la recette et poursuit', async () => {
    choice.and.resolveTo('skip');
    await run([entry({ id: 10, utilisateurId: 42, titre: 'Modifiée' }), entry()]);
    expect(api.updateRecette).not.toHaveBeenCalled();
    expect(api.createRecette).toHaveBeenCalledTimes(1);
  });
  it('interrompt au conflit en conservant les créations précédentes', async () => {
    choice.and.resolveTo('stop');
    await run([entry(), entry({ id: 10, utilisateurId: 42, titre: 'Modifiée' }), entry()]);
    expect(api.createRecette).toHaveBeenCalledTimes(1);
    expect(api.updateRecette).not.toHaveBeenCalled();
    expect(component.message).toContain('2 non traitée(s)');
  });
  it('ignore toute recette avec un ingrédient absent et poursuit', async () => {
    await run([entry({ ligneIngredients: [{ ingredientId: 999, quantite: 5 }] }), entry()]);
    expect(api.createRecette).toHaveBeenCalledTimes(1);
    expect(component.details[0]).toContain('999');
  });
  it('refuse une version inconnue avant toute écriture', async () => {
    await run([entry()], '2.0.0');
    expect(api.createRecette).not.toHaveBeenCalled();
    expect(component.error).toContain('version');
  });
  it('signale une recette invalide sans bloquer la suivante', async () => {
    await run([entry({ titre: '', autre: true }), entry()]);
    expect(api.createRecette).toHaveBeenCalledTimes(1);
    expect(component.message).toContain('1 en erreur');
  });
  it('arrête les écritures après un résultat API incertain', async () => {
    api.createRecette.and.returnValue(throwError(() => new Error('network')));
    await run([entry(), entry()]);
    expect(api.createRecette).toHaveBeenCalledTimes(1);
    expect(component.details[0]).toContain('non confirmé');
    expect(component.busy).toBeFalse();
  });
  it('produit une recette exportable sans données calculées', () => {
    const exported = exporterRecette(saved(), 42);
    expect(() => validerRecette(exported)).not.toThrow();
    expect(exported.utilisateurId).toBe(42);
    expect((exported as any).resultats).toBeUndefined();
    expect(recettesIdentiques(exported, entry())).toBeTrue();
  });
  it('ouvre le vrai modal à deux colonnes et termine sur Passer', async () => {
    const fixture = TestBed.createComponent(RecipeExchange);
    fixture.detectChanges();
    const view = fixture.componentInstance;
    view.rows = [{ label: 'Titre', current: 'Avant', incoming: 'Après' }];
    fixture.detectChanges();
    const decision = view.askConflict();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBeTrue();
    expect(dialog.querySelectorAll('section').length).toBe(2);
    const skip = Array.from(dialog.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Passer')!;
    skip.click();
    expect(await decision).toBe('skip');
    expect(dialog.open).toBeFalse();
    fixture.destroy();
  });
  it('rejette une enveloppe invalide et les nombres hors limites', () => {
    expect(() => lireFichierRecettes('{')).toThrow();
    expect(() => validerRecette(entry({ concentrationAlcalin: 0 }))).toThrow();
    expect(() => validerRecette(entry({ id: 1.5 }))).toThrow();
  });
});
