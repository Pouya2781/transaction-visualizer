import {Edge, Node} from '@antv/x6';
import {ComponentRef} from '@angular/core';

export interface CustomEdgeMetadata extends Edge.Metadata {
    labelShape: string;
    source: Node;
    target: Node;
    ngArguments?: {[key: string]: any};
}

export class CustomEdge extends Edge<Edge.Properties> {
    componentRef!: ComponentRef<any>;
    initialization!: Promise<any>;
    initializationResolver!: (value: any | PromiseLike<any>) => void;
    ngArguments!: {[key: string]: any};
    labelShape!: string;
    initLabelData!: () => void;
    setLabelData!: (ngArguments: {[key: string]: any}) => void;
}
