import {Injectable} from '@angular/core';
import {Stencil} from '@antv/x6-plugin-stencil';
import {Node} from '@antv/x6';
import {GraphService} from './graph.service';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {ModalComponent} from '../components/modal/modal.component';
import {StencilGroupData} from '../models/stencil-group-data.type';
import {STENCIL_GROUP_DATA} from '../data/stencil-group';

@Injectable({
    providedIn: 'root',
})
export class StencilService {
    private stencil!: Stencil;
    private stencilGroupData: StencilGroupData[] = STENCIL_GROUP_DATA;

    public constructor(
        private readonly graphService: GraphService,
        private readonly modalService: NzModalService
    ) {}

    public init(stencilContainerRef: HTMLElement): void {
        this.stencil = new Stencil({
            title: 'انواع حساب',
            target: this.graphService.getGraph,
            search(cell: Node<Node.Properties>, keyword: string): boolean {
                return cell.shape.indexOf(keyword) !== -1;
            },
            placeholder: 'جستجو بر اساس نام',
            notFoundText: 'یافت نشد!',
            collapsable: true,
            stencilGraphHeight: 0,
            getDropNode: (draggingNode: Node<Node.Properties>) => {
                const node: Node<Node.Properties> = draggingNode.clone();
                this.graphService.mountCustomNode(node);

                const modal: NzModalRef = this.modalService.create({
                    nzTitle: 'ایجاد حساب جدید',
                    nzContent: ModalComponent,
                    nzCentered: true,
                    nzOnCancel: (): void => {
                        this.graphService.getGraph.removeNode(node.id);
                    },
                    nzFooter: null,
                });

                modal.afterClose.subscribe((result): void => {
                    node.setData({
                        ngArguments: {
                            bankAccount: result,
                            transactionCount: 0,
                        },
                    });
                });

                return node;
            },
            layoutOptions: {
                center: false,
                marginX: 15,
                marginY: 15,
            },
            groups: [
                {
                    name: 'group1',
                    title: 'حساب جاری',
                },
                {
                    name: 'group2',
                    title: 'حساب سپرده',
                },
                {
                    name: 'group3',
                    title: 'حساب پس انداز',
                },
            ],
        });

        stencilContainerRef.appendChild(this.stencil.container);
        this.renderNodesToStencil();
    }

    public createStencilNode(metaData: Node.Metadata, groupName: string): void {
        let group: StencilGroupData | undefined = this.stencilGroupData.find(
            (node: StencilGroupData): boolean => node.groupName === groupName
        );
        if (group) group.metaDatas.push(metaData);
        else this.stencilGroupData.push({metaDatas: [metaData], groupName});

        this.renderNodesToStencil();
    }

    public renderNodesToStencil(): void {
        this.stencilGroupData.forEach(({metaDatas, groupName}: StencilGroupData) =>
            this.stencil.load(metaDatas, groupName)
        );
    }
}
