import {Injectable} from '@angular/core';
import {Stencil} from '@antv/x6-plugin-stencil';
import {Graph} from '@antv/x6';
import {GraphService} from './graph.service';

@Injectable({
    providedIn: 'root',
})
export class StencilService {
    private stencil!: Stencil;
    constructor(private graphService: GraphService) {}

    public createStencil(stencilContainerRef: HTMLElement) {
        this.stencil = new Stencil({
            title: 'Stencil',
            target: this.graphService.getGraph,
            search(cell, keyword) {
                return cell.shape.indexOf(keyword) !== -1;
            },
            placeholder: 'Search by shape name',
            notFoundText: 'Not Found',
            collapsable: true,
            stencilGraphHeight: 0,
            groups: [
                {
                    name: 'group1',
                    title: 'Group(Collapsable)',
                },
                {
                    name: 'group2',
                    title: 'Group',
                    collapsable: false,
                },
            ],
        });
        stencilContainerRef.appendChild(this.stencil.container);
    }
}
