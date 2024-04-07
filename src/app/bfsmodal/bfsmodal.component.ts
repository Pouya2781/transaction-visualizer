import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';

@Component({
    selector: 'app-bfsmodal',
    templateUrl: './bfsmodal.component.html',
    styleUrls: ['./bfsmodal.component.scss'],
})
export class BFSModalComponent {
    readonly #modal: NzModalRef = inject(NzModalRef);

    protected routeLength!: number;

    protected destroyModal(): void {
        this.#modal.destroy({routeLength: this.routeLength});
    }
}
