import {Component, Input, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormControl, FormGroup, NgForm, NonNullableFormBuilder, Validators} from '@angular/forms';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
    readonly #modal = inject(NzModalRef);

    protected ownerId!: number;
    protected ownerName: string = '';
    protected ownerFamilyName: string = '';
    protected branchName: string = '';
    protected branchAddress: string = '';
    protected branchTelephone!: number;
    protected sheba: string = '';
    protected cardId: string = '';
    protected accountId!: number;

    destroyModal(): void {
        this.#modal.destroy({
            transactionCount: 0,
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
