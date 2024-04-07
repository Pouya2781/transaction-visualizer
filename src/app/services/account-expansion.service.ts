import {Injectable} from '@angular/core';
import {forkJoin, Observable, ReplaySubject} from 'rxjs';
import {AccountCreation, PartialAccountCreationArray} from '../models/account-creation.type';
import {ApiService} from './api.service';
import {BankAccountService} from './bank-account.service';
import {TransactionService} from './transaction.service';
import {BankGraphNode} from '../models/bank-graph-node.type';
import {BankGraphEdge} from '../models/bank-graph-edge.type';
import {GraphService} from './graph.service';
import {LiteModeService} from './lite-mode.service';

@Injectable({
    providedIn: 'root',
})
export class AccountExpansionService {
    private readonly NODE_WIDTH: number = 270;
    private readonly NODE_HEIGHT: number = 80;
    private readonly CELL_PADDING: number = 80;
    private readonly RANDOM_OFFSET: number = 40;

    private readonly LITE_NODE_WIDTH: number = 115;
    private readonly LITE_NODE_HEIGHT: number = 40;
    private readonly LITE_CELL_PADDING: number = 40;
    private readonly LITE_RANDOM_OFFSET: number = 20;

    private nodeHeight: number = this.NODE_HEIGHT;
    private nodeWidth: number = this.NODE_WIDTH;
    private cellPadding: number = this.CELL_PADDING;
    private randomOffset: number = this.RANDOM_OFFSET;

    public constructor(
        private readonly apiService: ApiService,
        private readonly bankAccountService: BankAccountService,
        private readonly transactionService: TransactionService,
        private readonly graphService: GraphService,
        private liteModeService: LiteModeService
    ) {
        this.liteModeService.liteMode.subscribe((value) => {
            if (!value) {
                this.nodeWidth = this.NODE_WIDTH;
                this.nodeHeight = this.NODE_HEIGHT;
                this.cellPadding = this.CELL_PADDING;
                this.randomOffset = this.RANDOM_OFFSET;
            } else {
                this.nodeWidth = this.LITE_NODE_WIDTH;
                this.nodeHeight = this.LITE_NODE_HEIGHT;
                this.cellPadding = this.LITE_CELL_PADDING;
                this.randomOffset = this.LITE_RANDOM_OFFSET;
            }
        });
    }

    public expandAccount(
        bankGraphNodes: Map<number, BankGraphNode>,
        bankGraphEdges: Map<number, BankGraphEdge>,
        accountId: number
    ): Observable<Observable<PartialAccountCreationArray>> {
        const bankGraphNode: BankGraphNode | undefined = bankGraphNodes.get(accountId);

        const dummyObservable = new ReplaySubject<Partial<AccountCreation>>();
        dummyObservable.next({});
        dummyObservable.complete();
        const accountsAdded: [Observable<Partial<AccountCreation>>, ...Observable<AccountCreation>[]] = [
            dummyObservable,
        ];
        const apiCallResolved = new ReplaySubject<Observable<PartialAccountCreationArray>>();

        if (bankGraphNode) {
            const expandedNodePos = bankGraphNode.bankAccountNode.getPosition();
            this.apiService.getOutgoingTransaction(accountId).subscribe((transactions) => {
                for (let transaction of transactions) {
                    const accountAdded = this.bankAccountService.addAccountById(
                        bankGraphNodes,
                        transaction.destinationAccountId,
                        expandedNodePos,
                        false
                    );
                    accountsAdded.push(accountAdded);
                    accountAdded.subscribe((accountCreation) => {
                        if (accountCreation.bankGraphNode != undefined) {
                            this.transactionService.addTransaction(bankGraphNodes, bankGraphEdges, transaction);
                        }
                    });
                }
                apiCallResolved.next(forkJoin(accountsAdded));
            });
        }

        return apiCallResolved;
    }

    public expandAndLayoutAccount(
        bankGraphNodes: Map<number, BankGraphNode>,
        bankGraphEdges: Map<number, BankGraphEdge>,
        accountId: number,
        ignoreAccountLayout: number[]
    ): Observable<AccountCreation[]> {
        const accountsExpanded = new ReplaySubject<AccountCreation[]>();
        const bankGraphNode: BankGraphNode | undefined = bankGraphNodes.get(accountId);

        if (bankGraphNode) {
            this.expandAccount(bankGraphNodes, bankGraphEdges, accountId).subscribe((accountsAddedObservable) => {
                accountsAddedObservable.subscribe((accountCreationData) => {
                    const pureAccountCreationData: AccountCreation[] = accountCreationData.filter(
                        (accountCreation) => accountCreation.bankGraphNode != undefined
                    ) as AccountCreation[];
                    const bankAccountNodes = pureAccountCreationData
                        .filter((accountCreation) => {
                            return !ignoreAccountLayout.find((ignoredAccount) => {
                                return ignoredAccount == accountCreation.bankGraphNode.bankAccount.accountId;
                            });
                        })
                        .map((accountCreation) => accountCreation.bankGraphNode.bankAccountNode);
                    this.graphService
                        .layoutAroundCenter(
                            this.nodeWidth,
                            this.nodeHeight,
                            this.cellPadding,
                            bankGraphNode.bankAccountNode,
                            bankAccountNodes,
                            true,
                            this.randomOffset
                        )
                        .subscribe(() => {
                            accountsExpanded.next(pureAccountCreationData);
                        });
                });
            });
        }

        return accountsExpanded;
    }

    public expandAccountInDepthQueue(
        bankGraphNodes: Map<number, BankGraphNode>,
        bankGraphEdges: Map<number, BankGraphEdge>,
        expansionQueue: {depth: number; accountId: number}[],
        expandedAccounts: number[],
        ignoreAccountLayout: number[]
    ): void {
        const expansionData = expansionQueue.shift();
        if (expansionData) {
            expandedAccounts.push(expansionData.accountId);
            this.expandAndLayoutAccount(
                bankGraphNodes,
                bankGraphEdges,
                expansionData.accountId,
                ignoreAccountLayout
            ).subscribe((accountCreationData) => {
                for (let accountCreation of accountCreationData) {
                    ignoreAccountLayout.push(accountCreation.bankGraphNode.bankAccount.accountId);
                }
                if (expansionData.depth > 1) {
                    for (let accountCreation of accountCreationData) {
                        if (expandedAccounts.indexOf(accountCreation.bankGraphNode.bankAccount.accountId) == -1) {
                            expansionQueue.push({
                                accountId: accountCreation.bankGraphNode.bankAccount.accountId,
                                depth: expansionData.depth - 1,
                            });
                        }
                    }
                }
                this.expandAccountInDepthQueue(
                    bankGraphNodes,
                    bankGraphEdges,
                    expansionQueue,
                    expandedAccounts,
                    ignoreAccountLayout
                );
            });
        }
    }

    public expandAccountInDepth(
        bankGraphNodes: Map<number, BankGraphNode>,
        bankGraphEdges: Map<number, BankGraphEdge>,
        accountId: number,
        depth: number
    ): void {
        if (depth == 0) return;
        this.expandAccountInDepthQueue(
            bankGraphNodes,
            bankGraphEdges,
            [{accountId: accountId, depth: depth}],
            [],
            [accountId]
        );
    }
}
