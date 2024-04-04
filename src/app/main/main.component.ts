import {AfterViewInit, Component, ElementRef, Injector, Renderer2, ViewChild} from '@angular/core';
import {GraphService} from '../services/graph.service';
import {BankAccountComponent} from '../graph/node/bank-account/bank-account.component';
import {register} from '@antv/x6-angular-shape';
import {AccountType} from '../enums/account-type';
import {TransactionType} from '../enums/transaction-type';
import {TransactionComponent} from '../graph/edge/transcation/transaction.component';
import {ApiService} from '../services/api.service';
import {log} from 'ng-zorro-antd/core/logger';
import {StencilService} from '../services/stencil.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
})
export class MainComponent implements AfterViewInit {
    @ViewChild('graphContainer') graphContainer!: ElementRef;
    @ViewChild('stencilContainer') stencilContainer!: ElementRef;

    constructor(
        private graphService: GraphService,
        private stencilService: StencilService,
        private injector: Injector,
        private renderer: Renderer2
    ) {}
    ngAfterViewInit() {
        this.graphService.createGraph(this.graphContainer.nativeElement, this.renderer);
        this.stencilService.createStencil(this.stencilContainer.nativeElement);
        this.graphService.registerEdgeLabel('transaction-label', TransactionComponent);

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
                    ownerId: 1253664585,
                    ownerFamilyName: 'طباطبایی',
                    accountId: '6534454617',
                    branchName: 'گلوبندک',
                    branchAddress: 'تهران-خیابان خیام-بالاتر از چهارراه گلوبندک',
                    branchTelephone: '55638667',
                    sheba: 'IR120778801496000000198',
                    cardId: '6104335000000190',
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
                    ownerId: 1255664596,
                    ownerFamilyName: 'طباطبایی',
                    accountId: '6534454617',
                    branchName: 'گلوبندک',
                    branchAddress: 'تهران-خیابان خیام-بالاتر از چهارراه گلوبندک',
                    branchTelephone: '55638667',
                    sheba: 'IR120778801496000000198',
                    cardId: '6104335000000190',
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
                sourceAccountId: 6534454617,
                destinationAccountId: 6039548046,
                amount: '500000000',
                date: '1399/04/23',
                transactionId: '153348811341',
                type: TransactionType.PAYA,
            },
        });
    }
}
