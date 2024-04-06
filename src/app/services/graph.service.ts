import {Injectable, Injector, Renderer2} from '@angular/core';
import {Graph, Markup, Model, Node, Edge, Timing} from '@antv/x6';
import {DynamicNodeViewComponent, DynamicNodeViewComponentRef, InterconnectedNode} from '../models/node.type';
import {CustomEdge, CustomEdgeMetadata} from '../models/edge.type';
import {ComponentType} from '@angular/cdk/portal';
import {ComponentCreatorService} from './component-creator.service';
import {register} from '@antv/x6-angular-shape';
import {ReplaySubject} from 'rxjs';
import {Layout} from '../models/layout';

@Injectable({
    providedIn: 'root',
})
export class GraphService {
    private renderer!: Renderer2;

    private graph!: Graph;
    private nodeMap: Map<string, Node> = new Map<string, Node>();
    private nodeDynamicViewMap: Map<Element, string> = new Map<Element, string>();
    private nodeDynamicViewReverseMap: Map<string, DynamicNodeViewComponentRef> = new Map<
        string,
        DynamicNodeViewComponentRef
    >();
    private edgeLabelMap: Map<string, ComponentType<any>> = new Map<string, ComponentType<any>>();
    private edgeMap: Map<string, CustomEdge> = new Map<string, CustomEdge>();
    private resizeObserver: ResizeObserver;

    constructor(
        private componentCreatorService: ComponentCreatorService,
        private injector: Injector
    ) {
        this.resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const nodeId = this.nodeDynamicViewMap.get(entry.target);
                if (!!nodeId) {
                    const node = this.nodeMap.get(nodeId);

                    if (!!node) node.resize(entry.target.clientWidth, entry.target.clientHeight);
                }
            }
        });
    }

    get getGraph() {
        return this.graph;
    }

    public createGraph(container: HTMLElement, renderer: Renderer2) {
        this.graph = new Graph({
            container: container,
            background: {
                color: '#F2F7FA',
            },
            grid: true,
            onEdgeLabelRendered: (args) => {
                const element = args.selectors['foContent'] as HTMLDivElement;
                const foreignObject = args.selectors['fo'] as HTMLDivElement;

                this.renderer.setStyle(foreignObject, 'overflow', 'visible');
                this.renderer.setStyle(element, 'display', 'flex');
                this.renderer.setStyle(element, 'flex-direction', 'row');
                this.renderer.setStyle(element, 'justify-content', 'center');
                this.renderer.setStyle(element, 'align-items', 'center');

                const edge = this.edgeMap.get(args.edge.id);
                if (!!edge) {
                    const edgeLabelShape = this.edgeLabelMap.get(edge.labelShape);

                    if (!!edgeLabelShape) {
                        const componentRef = this.componentCreatorService.createComponent(element, edgeLabelShape);
                        edge.componentRef = componentRef;
                        edge.initLabelData();
                    }
                }

                return () => {};
            },
            connecting: {
                allowBlank: false,
            },
        });
        this.renderer = renderer;
    }

    public setUpDynamicResize(component: DynamicNodeViewComponentRef) {
        this.nodeDynamicViewMap.set(component.dynamicNodeView.nativeElement, component.nodeId);
        this.resizeObserver.observe(component.dynamicNodeView.nativeElement);
    }

    public registerEdgeLabel<T>(labelName: string, component: ComponentType<T>): void {
        this.edgeLabelMap.set(labelName, component);
    }

    public registerCustomNode<T>(shapeName: string, component: DynamicNodeViewComponent): void {
        register({
            shape: shapeName,
            content: component,
            injector: this.injector,
        });
    }

    public addCustomNode(metadata: Node.Metadata, options?: Model.AddOptions): Node {
        const uuid = crypto.randomUUID();
        metadata.data.ngArguments.nodeId = uuid;
        metadata.id = uuid;
        const newNode = this.graph.addNode(metadata);
        this.nodeMap.set(newNode.id, newNode);
        return newNode;
    }

    public mountCustomNode(node: Node<Node.Properties>): Node {
        node.setData({
            ngArguments: {
                nodeId: node.id,
            },
        });
        this.nodeMap.set(node.id, node);
        return node;
    }

    public addCustomEdge(metadata: CustomEdgeMetadata, options?: Model.AddOptions): CustomEdge {
        const newEdge = this.graph.createEdge({
            ...metadata,
            defaultLabel: {
                markup: Markup.getForeignObjectMarkup(),
                attrs: {
                    fo: {
                        width: 1,
                        height: 1,
                        x: 0,
                        y: 0,
                    },
                },
            },
        });
        const newCustomEdge = this.convertEdge(newEdge, metadata);
        this.edgeMap.set(newEdge.id, newCustomEdge);
        this.graph.addEdge(newEdge, options);
        return newCustomEdge;
    }

    private convertEdge(Edge: Edge, metadata: CustomEdgeMetadata): CustomEdge {
        const customEdge = Edge as CustomEdge;
        customEdge.ngArguments = metadata.ngArguments || {};
        customEdge.labelShape = metadata.labelShape;
        customEdge.initialization = new Promise((resolve, reject) => {
            customEdge.initializationResolver = resolve;
        });
        customEdge.setLabelData = async function (ngArguments: {[key: string]: any}) {
            await this.initialization;
            for (const value of Object.entries(ngArguments)) {
                this.componentRef.instance[value[0]] = value[1];
            }
        };
        customEdge.initLabelData = function () {
            for (const value of Object.entries(this.ngArguments)) {
                this.componentRef.instance[value[0]] = value[1];
            }
            this.initializationResolver(null);
        };
        return customEdge;
    }

    public removeEdge(id: string) {
        const edge = this.graph.removeEdge(id);
        if (!!edge) this.edgeMap.delete(edge.id);
        return edge;
    }

    public removeNode(id: string) {
        const node = this.graph.removeNode(id);
        if (!!node) {
            this.resizeObserver.unobserve(this.nodeDynamicViewReverseMap.get(node.id)?.dynamicNodeView.nativeElement);
            this.nodeMap.delete(node.id);
            this.nodeDynamicViewMap.delete(this.nodeDynamicViewReverseMap.get(node.id)?.dynamicNodeView.nativeElement);
            this.nodeDynamicViewReverseMap.delete(node.id);
        }
        return node;
    }

    public animateMove(node: Node, x: number, y: number) {
        const transitionDuration = 1000;
        node.translate(x - node.position().x, y - node.position().y, {
            transition: {
                duration: transitionDuration,
                timing: Timing.easeOutCubic,
            },
        });
        const transitionFinished = new ReplaySubject<void>();
        setTimeout(() => {
            transitionFinished.next();
            transitionFinished.complete();
        }, transitionDuration);
        return transitionFinished;
    }

    public layout(
        nodeWidth: number,
        nodeHeight: number,
        cellPadding: number,
        targetNodes: Node<Node.Properties>[] = this.graph.getNodes(),
        animated: boolean = false,
        randomOffset: number = 0
    ) {
        const customLayout: Layout = new Layout(this.graph, this, nodeWidth, nodeHeight, cellPadding, randomOffset);
        return customLayout.layout(targetNodes, animated);
    }

    public layoutAroundCenter(
        nodeWidth: number,
        nodeHeight: number,
        cellPadding: number,
        centerNode: Node<Node.Properties>,
        targetNodes: Node<Node.Properties>[] = this.graph.getNodes(),
        animated: boolean = false,
        randomOffset: number = 0
    ) {
        const customLayout: Layout = new Layout(this.graph, this, nodeWidth, nodeHeight, cellPadding, randomOffset);
        return customLayout.layoutAroundCenter(centerNode, targetNodes, animated);
    }
}
