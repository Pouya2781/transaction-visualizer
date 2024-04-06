import {Content} from '@antv/x6-angular-shape';
import {ElementRef} from '@angular/core';

export interface DynamicNodeView {
    dynamicNodeView: ElementRef;
}

export interface InterconnectedNodeId {//todo
    value: string;
}

export type DynamicNodeViewComponentRef = {interconnectedNode: InterconnectedNodeId; dynamicNodeView: DynamicNodeView};
export type DynamicNodeViewComponent = DynamicNodeViewComponentRef & Content;
