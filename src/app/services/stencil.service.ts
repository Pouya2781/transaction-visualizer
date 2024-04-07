import {Injectable} from '@angular/core';
import {Stencil} from '@antv/x6-plugin-stencil';
import {Node} from '@antv/x6';
import {GraphService} from './graph.service';
import {AccountType} from '../enums/account-type';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {ModalComponent} from '../modal/modal.component';
import {StencilGroupData} from '../models/stencil-group-data.type';

@Injectable({
    providedIn: 'root',
})
export class StencilService {
    private stencil!: Stencil;
    private nodes: StencilGroupData[] = [
        {
            metaDatas: [
                {
                    shape: 'custom-angular-component-node',
                    width: 290,
                    height: 80,
                    data: {
                        ngArguments: {
                            bankAccount: {
                                ownerName: 'افسر',
                                ownerId: 1253664585,
                                ownerFamilyName: 'طباطبایی',
                                accountId: '6534454617',
                                branchName: 'گلوبندک',
                                branchAddress: 'تهران-خیابان خیام-بالاتر از چهارراه گلوبندک',
                                branchTelephone: '55638667',
                                sheba: 'IR120778801496000000198',
                                cardId: '6104335000000190',
                                accountType: AccountType.CURRENT,
                                transactionCount: 196,
                            },
                        },
                    },
                },
            ],
            groupName: 'group1',
        },
        {
            metaDatas: [
                {
                    shape: 'custom-angular-component-node',
                    width: 290,
                    height: 80,
                    data: {
                        ngArguments: {
                            bankAccount: {
                                ownerName: 'افسر',
                                ownerId: 1253664585,
                                ownerFamilyName: 'طباطبایی',
                                accountId: '6534454617',
                                branchName: 'گلوبندک',
                                branchAddress: 'تهران-خیابان خیام-بالاتر از چهارراه گلوبندک',
                                branchTelephone: '55638667',
                                sheba: 'IR120778801496000000198',
                                cardId: '6104335000000190',
                                accountType: AccountType.DEPOSIT,
                                transactionCount: 196,
                            },
                        },
                    },
                },
            ],
            groupName: 'group2',
        },
        {
            metaDatas: [
                {
                    shape: 'custom-angular-component-node',
                    width: 290,
                    height: 80,
                    data: {
                        ngArguments: {
                            bankAccount: {
                                ownerName: 'افسر',
                                ownerId: 1253664585,
                                ownerFamilyName: 'طباطبایی',
                                accountId: '6534454617',
                                branchName: 'گلوبندک',
                                branchAddress: 'تهران-خیابان خیام-بالاتر از چهارراه گلوبندک',
                                branchTelephone: '55638667',
                                sheba: 'IR120778801496000000198',
                                cardId: '6104335000000190',
                                accountType: AccountType.SAVINGS,
                                transactionCount: 196,
                            },
                        },
                    },
                },
            ],
            groupName: 'group3',
        },
    ];
    public constructor(
        private graphService: GraphService,
        private modalService: NzModalService
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
        let group: StencilGroupData | undefined = this.nodes.find(
            (node: StencilGroupData): boolean => node.groupName === groupName
        );
        if (group) group.metaDatas.push(metaData);
        else this.nodes.push({metaDatas: [metaData], groupName});

        this.renderNodesToStencil();
    }

    public renderNodesToStencil(): void {
        this.nodes.forEach(({metaDatas, groupName}: StencilGroupData) => this.stencil.load(metaDatas, groupName));
    }
}
