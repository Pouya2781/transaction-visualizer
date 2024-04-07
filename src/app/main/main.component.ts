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
        this.graphService.getGraph.zoomTo(0.65, {center: {x: 0, y: 0}});

        register({
            shape: 'custom-angular-component-node',
            content: BankAccountComponent,
            injector: this.injector,
        });
    }
}
