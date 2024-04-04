import {Component} from '@angular/core';
import {ApiService} from '../services/api.service';
import {GraphService} from '../services/graph.service';
import {AccountType} from '../enums/account-type';
import {BankGraphService} from '../services/bank-graph.service';
import {BankAccount} from '../models/bank-account';
import {Transaction} from '../models/transaction';

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
        this.apiService.getAccount(6534454617).subscribe((bankAccount: BankAccount) => {
            this.bankGraphService.addAccount(bankAccount);
        });
        this.apiService.getAccount(6039548046).subscribe((bankAccount: BankAccount) => {
            this.bankGraphService.addAccount(bankAccount);
        });
        this.apiService.getOutgoingTransaction(6534454617).subscribe((transactions: Transaction[]) => {
            console.log(transactions[0]);
            this.bankGraphService.addTransaction(transactions[0]);
        });
        // this.apiService.getAccount(value).subscribe((bankAccount: BankAccount) => {
        //     console.log(bankAccount);
        //     this.bankGraphService.addAccount(bankAccount);
        //     // this.graphService.addCustomNode({
        //     //     shape: 'custom-angular-component-node',
        //     //     x: 100,
        //     //     y: 100,
        //     //     data: {
        //     //         ngArguments: {
        //     //             ...account,
        //     //             transactionCount: 0,
        //     //         },
        //     //     },
        //     // });
        // });
    }
}
