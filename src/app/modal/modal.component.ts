import {Component, inject} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
    readonly #modal: NzModalRef = inject(NzModalRef);

    protected ownerId!: number;
    protected ownerName: string = '';
    protected ownerFamilyName: string = '';
    protected branchName: string = '';
    protected branchAddress: string = '';
    protected branchTelephone!: number;
    protected sheba: string = '';
    protected cardId: string = '';
    protected accountId!: number;

    protected destroyModal(): void {
        this.#modal.destroy({
            ownerId: +this.ownerId,
            ownerName: this.ownerName,
            ownerFamilyName: this.ownerFamilyName,
            branchName: this.branchName,
            branchAddress: this.branchAddress,
            branchTelephone: +this.branchTelephone,
            sheba: this.sheba,
            cardId: this.cardId,
            accountId: +this.accountId,
        });
    }
}
