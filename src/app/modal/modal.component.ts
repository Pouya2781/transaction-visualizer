import {Component, Input, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
    @Input() public favoriteLibrary = 'x';
    @Input() public favoriteFramework = 'x';

    readonly #modal = inject(NzModalRef);
    readonly nzModalData = inject(NZ_MODAL_DATA);

    destroyModal(): void {
        this.#modal.destroy({data: 'this the result data'});
    }
}
