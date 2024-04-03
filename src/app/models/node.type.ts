import {Content} from '@antv/x6-angular-shape';
import {ElementRef} from '@angular/core';

export interface DynamicNodeView {
    dynamicNodeView: ElementRef;
}

export interface InterconnectedNode {
    nodeId: string;
}

export type DynamicNodeViewComponentRef = InterconnectedNode & DynamicNodeView;
export type DynamicNodeViewComponent = DynamicNodeViewComponentRef & Content;
