import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {GraphService} from '../services/graph.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
})
export class MainComponent implements AfterViewInit {
    @ViewChild('graphContainer') graphContainer!: ElementRef;

    constructor(private graphService: GraphService) {}
    ngAfterViewInit() {
        this.graphService.createGraph(this.graphContainer.nativeElement);
    }
}
