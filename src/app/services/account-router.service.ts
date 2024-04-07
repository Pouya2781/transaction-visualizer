import {Injectable} from '@angular/core';
import {BankGraphNode} from '../models/bank-graph-node.type';
import {BankGraphEdge} from '../models/bank-graph-edge.type';
import {NzModalService} from 'ng-zorro-antd/modal';
import {GraphService} from './graph.service';
import {BankAccountSelectionService} from './bank-account-selection.service';

@Injectable({
    providedIn: 'root',
})
export class AccountRouterService {
    public constructor(
        private readonly modalService: NzModalService,
        private readonly graphService: GraphService,
        private readonly bankAccountSelectionService: BankAccountSelectionService
    ) {}

    public routeInLength(
        openAccounts: {
            bankGraphNode: BankGraphNode;
            length: number;
            route: {bankGraphNodes: BankGraphNode[]; bankGraphEdges: BankGraphEdge[]};
        }[],
        destinationBankGraphNode: BankGraphNode,
        routes: {bankGraphNodes: BankGraphNode[]; bankGraphEdges: BankGraphEdge[]}[]
    ): void {
        while (openAccounts.length > 0) {
            const account = openAccounts.shift();

            if (account) {
                if (account.bankGraphNode == destinationBankGraphNode) {
                    routes.push({
                        bankGraphNodes: [...account.route.bankGraphNodes],
                        bankGraphEdges: [...account.route.bankGraphEdges],
                    });
                } else {
                    if (account.length > 0) {
                        const uniqueEdges: BankGraphEdge[] = [];
                        for (let bankGraphEdge of account.bankGraphNode.outgoingBankGraphEdges) {
                            if (
                                !uniqueEdges.find(
                                    (p) => p.destinationBankGraphNode == bankGraphEdge.destinationBankGraphNode
                                )
                            ) {
                                uniqueEdges.push(bankGraphEdge);
                            }
                        }

                        for (let bankGraphEdge of uniqueEdges) {
                            if (!account.route.bankGraphNodes.includes(bankGraphEdge.destinationBankGraphNode)) {
                                openAccounts.push({
                                    bankGraphNode: bankGraphEdge.destinationBankGraphNode,
                                    length: account.length - 1,
                                    route: {
                                        bankGraphNodes: [
                                            ...account.route.bankGraphNodes,
                                            bankGraphEdge.destinationBankGraphNode,
                                        ],
                                        bankGraphEdges: [...account.route.bankGraphEdges, bankGraphEdge],
                                    },
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    public route(
        bankGraphNodes: Map<number, BankGraphNode>,
        sourceAccountId: number,
        destinationAccountId: number,
        length: number
    ): {bankGraphNodes: BankGraphNode[]; bankGraphEdges: BankGraphEdge[]}[] {
        const sourceBankGraphNode: BankGraphNode | undefined = bankGraphNodes.get(sourceAccountId);
        if (!sourceBankGraphNode) return [];
        const destinationBankGraphNode: BankGraphNode | undefined = bankGraphNodes.get(destinationAccountId);
        if (!destinationBankGraphNode) return [];
        if (sourceBankGraphNode == destinationBankGraphNode) return [];
        length = Math.max(0, Math.min(7, length));

        const routes: {bankGraphNodes: BankGraphNode[]; bankGraphEdges: BankGraphEdge[]}[] = [];
        this.routeInLength(
            [
                {
                    bankGraphNode: sourceBankGraphNode,
                    length: length,
                    route: {bankGraphNodes: [sourceBankGraphNode], bankGraphEdges: []},
                },
            ],
            destinationBankGraphNode,
            routes
        );
        return routes;
    }

    public executeRouting(bankGraphNodes: Map<number, BankGraphNode>, length: number, showModal: boolean): void {
        this.graphService.resetAllEdgeHighlights();
        const routes = this.route(
            bankGraphNodes,
            this.bankAccountSelectionService.selectedComponents[0].bankAccount.accountId,
            this.bankAccountSelectionService.selectedComponents[1].bankAccount.accountId,
            length
        );

        if (showModal && routes.length == 0) {
            this.modalService.warning({
                nzTitle: 'مسیر پیدا نشد',
                nzContent: `!مسیری با حداقل طول ${length}  وجود ندارد`,
            });
        }

        for (let route of routes) {
            for (let bankGraphEdge of route.bankGraphEdges) {
                this.graphService.highlightEdge(bankGraphEdge.transactionEdge);
            }
        }
    }
}
