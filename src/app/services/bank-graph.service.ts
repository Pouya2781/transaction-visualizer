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
import {AccountRouterService} from './account-router.service';

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
        private readonly bankAccountSelectionService: BankAccountSelectionService,
        private readonly bankAccountService: BankAccountService,
        private readonly transactionService: TransactionService,
        private readonly accountExpansionService: AccountExpansionService,
        private readonly accountRouterService: AccountRouterService
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
    ): void {
        this.accountRouterService.routeInLength(openAccounts, destinationBankGraphNode, routes);
    }

    public route(
        sourceAccountId: number,
        destinationAccountId: number,
        length: number
    ): {
        bankGraphNodes: BankGraphNode[];
        bankGraphEdges: BankGraphEdge[];
    }[] {
        return this.accountRouterService.route(this.bankGraphNodes, sourceAccountId, destinationAccountId, length);
    }

    public executeRouting(length: number, showModal: boolean): void {
        this.accountRouterService.executeRouting(this.bankGraphNodes, length, showModal);
    }
}
