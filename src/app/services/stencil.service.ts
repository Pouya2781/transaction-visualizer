import {Injectable, Injector} from '@angular/core';
import {Stencil} from '@antv/x6-plugin-stencil';
import {Node} from '@antv/x6';
import {GraphService} from './graph.service';
import {AccountType} from '../enums/account-type';
import {register} from '@antv/x6-angular-shape';
import {BankAccountComponent} from '../graph/node/bank-account/bank-account.component';
import {NzModalService} from 'ng-zorro-antd/modal';
import {ModalComponent} from '../modal/modal.component';

@Injectable({
    providedIn: 'root',
})
export class StencilService {
    private stencil!: Stencil;
    private nodes: {metaDatas: Node.Metadata[]; groupName: string}[] = [
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
    constructor(
        private graphService: GraphService,
        private modalService: NzModalService,
        private injector: Injector
    ) {}

    public createStencil(stencilContainerRef: HTMLElement) {
        this.stencil = new Stencil({
            title: 'انواع حساب',
            target: this.graphService.getGraph,
            search(cell, keyword) {
                return cell.shape.indexOf(keyword) !== -1;
            },
            placeholder: 'جستجو بر اساس نام',
            notFoundText: 'یافت نشد!',
            collapsable: true,
            stencilGraphHeight: 0,
            getDropNode: (draggingNode, options) => {
                const node = draggingNode.clone();
                this.graphService.mountCustomNode(node);

                const modal = this.modalService.create({
                    nzTitle: 'ایجاد حساب جدید',
                    nzContent: ModalComponent,
                    nzData: {
                        favoriteLibrary: 'angular',
                        favoriteFramework: 'angular',
                    },
                    nzCentered: true,
                    nzOnCancel: () => {
                        this.graphService.getGraph.removeNode(node.id);
                    },
                    nzFooter: null,
                });

                modal.afterClose.subscribe((result) => {
                    node.setData({
                        ngArguments: result,
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

        register({
            shape: 'custom-angular-component-node',
            content: BankAccountComponent,
            injector: this.injector,
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
