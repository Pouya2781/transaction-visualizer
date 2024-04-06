import {Component, Input, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
    readonly #modal = inject(NzModalRef);
    readonly nzModalData = inject(NZ_MODAL_DATA);

    // public transactionCount!: number;
    public ownerId!: number;
    public ownerName!: string;
    public ownerFamilyName!: string;
    public branchName!: string;
    public branchAddress!: string;
    public branchTelephone!: number;
    public sheba!: string;
    public cardId!: string;
    public accountId!: number;

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
