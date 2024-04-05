import {Injectable} from '@angular/core';
import {Stencil} from '@antv/x6-plugin-stencil';
import {Node} from '@antv/x6';
import {GraphService} from './graph.service';

@Injectable({
    providedIn: 'root',
})
export class StencilService {
    private stencil!: Stencil;
    private nodes: {metaDatas: Node.Metadata[]; groupName: string}[] = [
        {
            metaDatas: [
                {
                    shape: 'rect',
                    width: 80,
                    height: 40,
                    label: 'rect',
                    ports: {
                        groups: {
                            input: {
                                attrs: {
                                    circle: {
                                        r: 6,
                                        magnet: 'passive',
                                        stroke: '#31d0c6',
                                        fill: '#fff',
                                        strokeWidth: 2,
                                    },
                                },
                                position: 'left',
                            },
                            output: {
                                attrs: {
                                    circle: {
                                        r: 6,
                                        magnet: true,
                                        stroke: '#990000',
                                        fill: '#fff',
                                        strokeWidth: 2,
                                    },
                                },
                                position: 'right',
                            },
                        },
                        items: [
                            {id: 'input-port', group: 'input'},
                            {id: 'output-port', group: 'output'},
                        ],
                    },
                },
                {
                    shape: 'circle',
                    width: 40,
                    height: 40,
                    label: 'circle',
                },
            ],
            groupName: 'group1',
        },
        {
            metaDatas: [
                {
                    shape: 'ellipse',
                    width: 80,
                    height: 40,
                    label: 'ellipse',
                    ports: {
                        groups: {
                            input: {
                                attrs: {
                                    circle: {
                                        r: 6,
                                        magnet: true,
                                        stroke: '#31d0c6',
                                        fill: '#fff',
                                        strokeWidth: 2,
                                    },
                                },
                                position: 'left',
                            },
                            output: {
                                attrs: {
                                    circle: {
                                        r: 6,
                                        magnet: true,
                                        stroke: '#990000',
                                        fill: '#fff',
                                        strokeWidth: 2,
                                    },
                                },
                                position: 'right',
                            },
                        },
                        items: [
                            {id: 'input-port', group: 'input'},
                            {id: 'output-port', group: 'output'},
                        ],
                    },
                },
                {
                    shape: 'path',
                    width: 40,
                    height: 40,
                    // https://www.svgrepo.com/svg/13653/like
                    path: 'M24.85,10.126c2.018-4.783,6.628-8.125,11.99-8.125c7.223,0,12.425,6.179,13.079,13.543c0,0,0.353,1.828-0.424,5.119c-1.058,4.482-3.545,8.464-6.898,11.503L24.85,48L7.402,32.165c-3.353-3.038-5.84-7.021-6.898-11.503c-0.777-3.291-0.424-5.119-0.424-5.119C0.734,8.179,5.936,2,13.159,2C18.522,2,22.832,5.343,24.85,10.126z',
                    label: 'path',
                },
            ],
            groupName: 'group2',
        },
    ];
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
                    title: 'Group 1',
                },
                {
                    name: 'group2',
                    title: 'Group 2',
                },
            ],
        });

        stencilContainerRef.appendChild(this.stencil.container);
        this.renderNodesToStencil();
    }

    public createStencilNode(metaData: Node.Metadata, groupName: string) {
        let group = this.nodes.find((node) => node.groupName === groupName);
        if (group) group.metaDatas.push(metaData);
        else this.nodes.push({metaDatas: [metaData], groupName});

        this.renderNodesToStencil();
    }

    public renderNodesToStencil() {
        this.nodes.forEach(({metaDatas, groupName}) => this.stencil.load(metaDatas, groupName));
    }
}
