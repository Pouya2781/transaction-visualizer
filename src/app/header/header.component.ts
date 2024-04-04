import {Component} from '@angular/core';
import {ApiService} from '../services/api.service';
import {GraphService} from '../services/graph.service';
import {AccountType} from '../enums/account-type';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    console: any = console;

    constructor(
        private apiService: ApiService,
        private graphService: GraphService
    ) {}
    onSearch(value: string) {
        this.apiService.getAccount(value).subscribe((account: {[key: string]: any}) => {
            console.log(account);
            this.graphService.addCustomNode({
                shape: 'custom-angular-component-node',
                x: 100,
                y: 100,
                data: {
                    ngArguments: {
                        ...account,
                        transactionCount: 0,
                    },
                },
            });
        });
    }
}
