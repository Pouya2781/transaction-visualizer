import {Component} from '@angular/core';
import {BankGraphService} from '../../services/bank-graph.service';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {LiteModeService} from '../../services/lite-mode.service';
import {BFSModalComponent} from '../bfsmodal/bfsmodal.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    public constructor(
        public readonly bankGraphService: BankGraphService,
        private readonly modalService: NzModalService,
        private readonly liteModeService: LiteModeService
    ) {}

    protected onSearch(value: string): void {
        this.bankGraphService.addAccountById(+value || 6534454617, {x: 200, y: 200}, true);
    }

    protected onLiteMode(value: boolean): void {
        this.liteModeService.setLiteMode(value);
    }

    protected onExecuteRouting(): void {
        if (this.bankGraphService.canExecuteRouting) {
            const modal: NzModalRef = this.modalService.create({
                nzTitle: 'مسیریابی',
                nzContent: BFSModalComponent,
                nzFooter: null,
            });

            modal.afterClose.subscribe((result): void => {
                this.bankGraphService.executeRouting(result.routeLength, true);
            });
        }
    }
}
