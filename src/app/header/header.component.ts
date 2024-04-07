import {Component} from '@angular/core';
import {ApiService} from '../services/api.service';
import {GraphService} from '../services/graph.service';
import {AccountType} from '../enums/account-type';
import {BankGraphService} from '../services/bank-graph.service';
import {BankAccount} from '../models/bank-account';
import {Transaction} from '../models/transaction';
import {NzModalService} from 'ng-zorro-antd/modal';
import {BFSModalComponent} from '../bfsmodal/bfsmodal.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    console: any = console;

    constructor(
        public bankGraphService: BankGraphService,
        private modalService: NzModalService
    ) {}
    onSearch(value: string) {
        this.bankGraphService.addAccountById(6534454617, {x: 200, y: 200}, true);
        // this.bankGraphService.addAccountById(6534454617, {x: 200, y: 200});
    }

    onLiteMode(value: boolean) {
        this.bankGraphService.setLightMode(value);
    }

    onExecuteRouting() {
        if (this.bankGraphService.canExecuteRouting) {
            const modal = this.modalService.create({
                nzTitle: 'مسیریابی',
                nzContent: BFSModalComponent,
                nzFooter: null,
            });

            modal.afterClose.subscribe((result) => {
                this.bankGraphService.executeRouting(result.routeLength);
            });
        }
    }
}
