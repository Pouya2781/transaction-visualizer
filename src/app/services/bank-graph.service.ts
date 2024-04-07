import {Injectable, Injector} from '@angular/core';
import {Transaction} from '../models/transaction';
import {BankAccount} from '../models/bank-account';
import {BankGraphEdge} from '../models/bank-graph-edge';
import {GraphService} from './graph.service';
import {BankGraphNode} from '../models/bank-graph-node';
import {ApiService} from './api.service';
import {BehaviorSubject, forkJoin, Observable, ReplaySubject} from 'rxjs';
import {BankAccountComponent} from '../graph/node/bank-account/bank-account.component';
import {PointLike} from '@antv/x6';
import {AccountCreation, PartialAccountCreationArray} from '../models/account-creation';
import {NzModalService} from 'ng-zorro-antd/modal';
import {register} from '@antv/x6-angular-shape';
import {TransactionComponent} from '../graph/edge/transcation/transaction.component';
import {BankAccountSelectionService} from './bank-account-selection.service';
import {LiteModeService} from './lite-mode.service';
import {BankAccountService} from './bank-account.service';
import {TransactionService} from './transaction.service';
import {AccountExpansionService} from './account-expansion.service';

@Injectable({
    providedIn: 'root',
})
export class BankGraphService {
    public bankGraphNodes: Map<number, BankGraphNode> = new Map<number, BankGraphNode>();
    public bankGraphEdges: Map<number, BankGraphEdge> = new Map<number, BankGraphEdge>();

    public get canExecuteRouting() {
        return this.bankAccountSelectionService.selectedComponents.length == this.SELECTION_LIMIT;
    }
    public get selectedComponents() {
        return this.bankAccountSelectionService.selectedComponents;
    }

    private readonly SELECTION_LIMIT = 2;

    constructor(
        private readonly graphService: GraphService,
        private readonly apiService: ApiService,
        private readonly modalService: NzModalService,
        private readonly bankAccountSelectionService: BankAccountSelectionService,
        private readonly bankAccountService: BankAccountService,
        private readonly transactionService: TransactionService,
        private readonly accountExpansionService: AccountExpansionService
    ) {
        this.bankAccountSelectionService.init(this.SELECTION_LIMIT);
    }

    public init(injector: Injector) {
        this.graphService.registerEdgeLabel('transaction-label', TransactionComponent);
        register({
            shape: 'custom-angular-component-node',
            content: BankAccountComponent,
            injector: injector,
        });
    }

    public requestSelection(component: BankAccountComponent): number {
        return this.bankAccountSelectionService.requestSelection(component);
    }

    public requestDeselection(component: BankAccountComponent): number {
        this.graphService.resetAllEdgeHighlights();
        return this.bankAccountSelectionService.requestDeselection(component);
    }

    public addAccountById(accountId: number, pos: PointLike, showModal: boolean): Observable<Partial<AccountCreation>> {
        return this.bankAccountService.addAccountById(this.bankGraphNodes, accountId, pos, showModal);
    }

    public addAccount(bankAccount: BankAccount, pos: PointLike): BankGraphNode {
        return this.bankAccountService.addAccount(this.bankGraphNodes, bankAccount, pos);
    }

    public deleteAccount(accountID: number): void {
        return this.bankAccountService.deleteAccount(this.bankGraphNodes, this.bankGraphEdges, accountID);
    }

    public addTransaction(transaction: Transaction): void {
        this.transactionService.addTransaction(this.bankGraphNodes, this.bankGraphEdges, transaction);
    }

    public deleteTransaction(transactionId: number): void {
        this.transactionService.deleteTransaction(this.bankGraphEdges, transactionId);
    }

    public expandAccount(accountId: number): Observable<Observable<PartialAccountCreationArray>> {
        return this.accountExpansionService.expandAccount(this.bankGraphNodes, this.bankGraphEdges, accountId);
    }

    public expandAndLayoutAccount(accountId: number, ignoreAccountLayout: number[]): Observable<AccountCreation[]> {
        return this.accountExpansionService.expandAndLayoutAccount(
            this.bankGraphNodes,
            this.bankGraphEdges,
            accountId,
            ignoreAccountLayout
        );
    }

    public expandAccountInDepthQueue(
        expansionQueue: {depth: number; accountId: number}[],
        expandedAccounts: number[],
        ignoreAccountLayout: number[]
    ): void {
        return this.accountExpansionService.expandAccountInDepthQueue(
            this.bankGraphNodes,
            this.bankGraphEdges,
            expansionQueue,
            expandedAccounts,
            ignoreAccountLayout
        );
    }

    public expandAccountInDepth(accountId: number, depth: number): void {
        this.accountExpansionService.expandAccountInDepth(this.bankGraphNodes, this.bankGraphEdges, accountId, depth);
    }

    public routeInLength(
        openAccounts: {
            bankGraphNode: BankGraphNode;
            length: number;
            route: {bankGraphNodes: BankGraphNode[]; bankGraphEdges: BankGraphEdge[]};
        }[],
        destinationBankGraphNode: BankGraphNode,
        routes: {bankGraphNodes: BankGraphNode[]; bankGraphEdges: BankGraphEdge[]}[]
    ) {
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

    public route(sourceAccountId: number, destinationAccountId: number, length: number) {
        const sourceBankGraphNode = this.bankGraphNodes.get(sourceAccountId);
        if (!sourceBankGraphNode) return [];
        const destinationBankGraphNode = this.bankGraphNodes.get(destinationAccountId);
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

    public executeRouting(length: number, showModal: boolean) {
        this.graphService.resetAllEdgeHighlights();
        const routes = this.route(
            this.selectedComponents[0].bankAccount.accountId,
            this.selectedComponents[1].bankAccount.accountId,
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
