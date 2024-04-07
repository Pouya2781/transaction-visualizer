import {Edge, Node} from '@antv/x6';
import {ComponentRef} from '@angular/core';

export interface CustomEdgeMetadata extends Edge.Metadata {
    labelShape: string;
    source: Node;
    target: Node;
    ngArguments?: {[key: string]: any};
}

export class CustomEdge extends Edge<Edge.Properties> {
    public componentRef!: ComponentRef<any>;
    public initialization!: Promise<any>;
    public initializationResolver!: (value: any | PromiseLike<any>) => void;
    public ngArguments!: {[key: string]: any};
    public labelShape!: string;
    public initLabelData!: () => void;
    public setLabelData!: (ngArguments: {[key: string]: any}) => void;
}
