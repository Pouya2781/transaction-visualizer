import {AfterViewInit, Component, ElementRef, Injector, Renderer2, ViewChild} from '@angular/core';
import {GraphService} from '../services/graph.service';
import {StencilService} from '../services/stencil.service';
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
