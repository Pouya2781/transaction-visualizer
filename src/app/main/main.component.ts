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
import {MiniMap} from '@antv/x6-plugin-minimap';
import {BankGraphService} from '../services/bank-graph.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
})
export class MainComponent implements AfterViewInit {
    @ViewChild('graphContainer') private graphContainer!: ElementRef;
    @ViewChild('stencilContainer') private stencilContainer!: ElementRef;

    constructor(
        private readonly graphService: GraphService,
        private readonly stencilService: StencilService,
        private readonly bankGraphService: BankGraphService,
        private readonly injector: Injector,
        private readonly renderer: Renderer2
    ) {}
    ngAfterViewInit(): void {
        this.graphService.init(this.graphContainer.nativeElement, this.renderer);
        this.bankGraphService.init(this.injector);
        this.stencilService.init(this.stencilContainer.nativeElement);
    }
}
