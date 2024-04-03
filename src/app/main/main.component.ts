import {AfterViewInit, Component, ElementRef, Injector, Renderer2, ViewChild} from '@angular/core';
import {GraphService} from '../services/graph.service';
import {BankAccountComponent} from '../graph/node/bank-account/bank-account.component';
import {register} from '@antv/x6-angular-shape';
import {AccountType} from '../enums/account-type';
import {TransactionType} from '../enums/transaction-type';
import {TranscationComponent} from '../graph/edge/transcation/transcation.component';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
})
export class MainComponent implements AfterViewInit {
    @ViewChild('graphContainer') graphContainer!: ElementRef;

    constructor(
        private graphService: GraphService,
        private injector: Injector,
        private renderer: Renderer2
    ) {}
    ngAfterViewInit() {
        this.graphService.createGraph(this.graphContainer.nativeElement, this.renderer);
        // this.graphService.registerCustomNode('bank-account', BankAccountComponent);
        this.graphService.registerEdgeLabel('transaction-label', TranscationComponent);

        register({
            shape: 'custom-angular-component-node',
            content: BankAccountComponent,
            injector: this.injector,
        });
        let node1 = this.graphService.addCustomNode({
            shape: 'custom-angular-component-node',
            x: 100,
            y: 100,
            data: {
                ngArguments: {
                    ownerName: 'افسر',
                    ownerFamilyName: 'طباطبایی',
                    accountID: '6534454617',
                    branchName: 'گلوبندک',
                    branchAddress: 'تهران-خیابان خیام-بالاتر از چهارراه گلوبندک',
                    branchTelephone: '55638667',
                    sheba: 'IR120778801496000000198',
                    cardID: '6104335000000190',
                    accountType: AccountType.SAVINGS,
                    transactionCount: 196,
                },
            },
        });
        let node2 = this.graphService.addCustomNode({
            shape: 'custom-angular-component-node',
            x: 100,
            y: 100,
            data: {
                ngArguments: {
                    ownerName: 'افسر',
                    ownerFamilyName: 'طباطبایی',
                    accountID: '6534454617',
                    branchName: 'گلوبندک',
                    branchAddress: 'تهران-خیابان خیام-بالاتر از چهارراه گلوبندک',
                    branchTelephone: '55638667',
                    sheba: 'IR120778801496000000198',
                    cardID: '6104335000000190',
                    accountType: AccountType.SAVINGS,
                    transactionCount: 196,
                },
            },
        });
        const edge2 = this.graphService.addCustomEdge({
            shape: 'edge',
            source: node1,
            target: node2,
            router: {
                name: 'manhattan',
                args: {
                    side: 'right',
                    padding: {
                        left: 50,
                    },
                },
            },
            connector: {
                name: 'rounded',
                args: {
                    type: 'arc',
                    size: 5,
                },
            },
            labelShape: 'transaction-label',
            label: {
                position: 0.5,
            },
            attrs: {
                line: {
                    stroke: '#ccc',
                },
            },
            ngArguments: {
                sourceAccount: '6534454617',
                destinationAccount: '6039548046',
                amount: '500000000',
                date: new Date('1399/04/23'),
                transactionID: '153348811341',
                transactionType: TransactionType.PAYA,
            },
        });
    }
}
