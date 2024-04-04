import {Component} from '@angular/core';
import {ApiService} from '../services/api.service';
import {GraphService} from '../services/graph.service';
import {AccountType} from '../enums/account-type';
import {BankGraphService} from '../services/bank-graph.service';
import {BankAccount} from '../models/bank-account';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    console: any = console;

    constructor(
        private apiService: ApiService,
        private bankGraphService: BankGraphService
    ) {}
    onSearch(value: string) {
        this.apiService.getAccount(value).subscribe((bankAccount: BankAccount) => {
            console.log(bankAccount);
            this.bankGraphService.addAccount(bankAccount);
            // this.graphService.addCustomNode({
            //     shape: 'custom-angular-component-node',
            //     x: 100,
            //     y: 100,
            //     data: {
            //         ngArguments: {
            //             ...account,
            //             transactionCount: 0,
            //         },
            //     },
            // });
        });
    }
}
