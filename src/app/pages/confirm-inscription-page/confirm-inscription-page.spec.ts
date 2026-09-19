import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ConfirmInscriptionPage } from './confirm-inscription-page';

describe('ConfirmInscriptionPage', () => {
    function creer(key: string | null, response = of({ result: 'ok' })) {
        const service = jasmine.createSpyObj('AuthService', ['confirmInscription']);
        service.confirmInscription.and.returnValue(response);
        TestBed.configureTestingModule({
            imports: [ConfirmInscriptionPage],
            providers: [provideRouter([]),
                { provide: AuthService, useValue: service },
                { provide: ActivatedRoute, useValue: { snapshot: {
                    queryParamMap: convertToParamMap(key === null ? {} : { key }),
                } } },
            ],
        });
        const fixture = TestBed.createComponent(ConfirmInscriptionPage);
        fixture.detectChanges();
        return { fixture, service };
    }

    it('transmet le jeton et propose la connexion après activation', () => {
        const { fixture, service } = creer('test-key');
        expect(service.confirmInscription).toHaveBeenCalledOnceWith('test-key');
        expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/login');
    });

    it('affiche un échec métier même avec une réponse HTTP réussie', () => {
        const { fixture } = creer('expired', of({ result: 'echec' }));
        expect(fixture.componentInstance.etat).toBe('echec');
        expect(fixture.nativeElement.querySelector('a')).toBeNull();
    });

    it('ne contacte pas le backend sans jeton', () => {
        const { fixture, service } = creer(null);
        expect(service.confirmInscription).not.toHaveBeenCalled();
        expect(fixture.componentInstance.etat).toBe('echec');
    });

    it('affiche une erreur si le backend est indisponible', () => {
        const { fixture } = creer('test-key', throwError(() => new Error('network')));
        expect(fixture.componentInstance.etat).toBe('echec');
        expect(fixture.componentInstance.messageErreur).toContain('réessayer');
    });
});
