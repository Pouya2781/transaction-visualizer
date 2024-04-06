import {Injectable} from '@angular/core';
import {Transaction} from '../models/transaction';
import {BankAccount} from '../models/bank-account';
import {BankGraphEdge} from '../models/bank-graph-edge';
import {GraphService} from './graph.service';
import {BankGraphNode} from '../models/bank-graph-node';
import {ApiService} from './api.service';
import {BehaviorSubject, forkJoin, Observable, ReplaySubject} from 'rxjs';
import {BankAccountComponent} from '../graph/node/bank-account/bank-account.component';
import {PointLike} from '@antv/x6';
import {AccountCreation, PartialAccountCreationArray} from './account-creation';

@Injectable({
    providedIn: 'root',
})
export class BankGraphService {
    private bankGraphNodes: Map<number, BankGraphNode>;
    private bankGraphEdges: Map<number, BankGraphEdge>;
    public liteMode: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private selectedComponents: BankAccountComponent[] = [];

    private readonly NODE_WIDTH = 270;
    private readonly NODE_HEIGHT = 80;
    private readonly CELL_PADDING = 80;
    private readonly RANDOM_OFFSET = 40;

    private readonly LITE_NODE_WIDTH = 115;
    private readonly LITE_NODE_HEIGHT = 40;
    private readonly LITE_CELL_PADDING = 40;
    private readonly LITE_RANDOM_OFFSET = 20;

    private nodeHeight = this.NODE_HEIGHT;
    private nodeWidth = this.NODE_WIDTH;
    private cellPadding = this.CELL_PADDING;
    private randomOffset = this.RANDOM_OFFSET;

    constructor(
        private readonly graphService: GraphService,
        private apiService: ApiService
    ) {
        this.bankGraphNodes = new Map<number, BankGraphNode>();
        this.bankGraphEdges = new Map<number, BankGraphEdge>();
    }

    public setLightMode(value: boolean) {
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
        this.liteMode.next(value);
    }

    public requestSelection(component: BankAccountComponent) {
        if (this.selectedComponents.length == 2) return -1;
        if (this.selectedComponents.length == 1) {
            this.selectedComponents.push(component);
            return 1;
        }
        this.selectedComponents.push(component);
        return 0;
    }

    public requestDeselection(component: BankAccountComponent) {
        const selectionIndex = this.selectedComponents.indexOf(component);
        this.selectedComponents.splice(selectionIndex, 1);
        if (selectionIndex == 0 && this.selectedComponents.length == 1)
            this.selectedComponents[0].updateSelectionIndex(selectionIndex);
    }

    public addAccountById(accountId: number, pos: PointLike) {
        const replaySubject = new ReplaySubject<AccountCreation>();
        let bankGraphNode = this.bankGraphNodes.get(accountId);
        if (bankGraphNode) {
            replaySubject.next({created: false, bankGraphNode});
            replaySubject.complete();
            return replaySubject;
        }
        this.apiService.getAccount(accountId).subscribe((bankAccount: BankAccount) => {
            bankGraphNode = this.addAccount(bankAccount, pos);
            replaySubject.next({created: true, bankGraphNode});
            replaySubject.complete();
        });

        return replaySubject;
    }

    public addAccount(bankAccount: BankAccount, pos: PointLike) {
        let bankGraphNode = this.bankGraphNodes.get(bankAccount.accountId);
        if (bankGraphNode) return bankGraphNode;
        const node = this.graphService.addCustomNode({
            shape: 'custom-angular-component-node',
            x: pos.x,
            y: pos.y,
            data: {
                ngArguments: {
                    ...bankAccount,
                    transactionCount: 0,
                },
            },
        });
        bankGraphNode = {
            bankAccount,
            bankAccountNode: node,
            incomingBankGraphEdges: [],
            outgoingBankGraphEdges: [],
        };
        this.bankGraphNodes.set(bankAccount.accountId, bankGraphNode);
        return bankGraphNode;
    }

    public addTransaction(transaction: Transaction) {
        if (this.bankGraphEdges.get(transaction.transactionId)) return;
        const sourceBankGraphNode = this.bankGraphNodes.get(transaction.sourceAccountId);
        const destinationBankGraphNode = this.bankGraphNodes.get(transaction.destinationAccountId);

        if (!!sourceBankGraphNode && !!destinationBankGraphNode) {
            const edge = this.graphService.addCustomEdge({
                shape: 'edge',
                source: sourceBankGraphNode.bankAccountNode,
                target: destinationBankGraphNode.bankAccountNode,
                // router: {
                //     name: 'orth',
                //     args: {
                //         side: 'right',
                //         padding: 50,
                //     },
                // },
                connector: {
                    name: 'rounded',
                },
                labelShape: 'transaction-label',
                label: {
                    position: 0.5,
                },
                attrs: {
                    line: {
                        stroke: '#ccc',
                    },
                },
                ngArguments: transaction,
            });

            const bankGraphEdge = {transaction, transactionEdge: edge, sourceBankGraphNode, destinationBankGraphNode};
            sourceBankGraphNode.outgoingBankGraphEdges.push(bankGraphEdge);
            destinationBankGraphNode.incomingBankGraphEdges.push(bankGraphEdge);
            this.bankGraphEdges.set(transaction.transactionId, bankGraphEdge);
        }
    }

    public deleteAccount(accountID: number) {
        const bankGraphNode = this.bankGraphNodes.get(accountID);

        if (!!bankGraphNode) {
            for (let bankAccountEdge of bankGraphNode.outgoingBankGraphEdges) {
                this.deleteTransaction(bankAccountEdge.transaction.transactionId);
            }
            for (let bankAccountEdge of bankGraphNode.incomingBankGraphEdges) {
                this.deleteTransaction(bankAccountEdge.transaction.transactionId);
            }

            this.bankGraphNodes.delete(bankGraphNode.bankAccount.accountId);
            this.graphService.removeNode(bankGraphNode.bankAccountNode.id);
        }
    }

    public deleteTransaction(transactionID: number) {
        const bankGraphEdge = this.bankGraphEdges.get(transactionID);
        if (!!bankGraphEdge) {
            bankGraphEdge.sourceBankGraphNode.outgoingBankGraphEdges =
                bankGraphEdge.sourceBankGraphNode.outgoingBankGraphEdges.filter((bankGraphEdge) => {
                    return !(
                        bankGraphEdge.transaction.sourceAccountId == bankGraphEdge.transaction.sourceAccountId &&
                        bankGraphEdge.transaction.destinationAccountId == bankGraphEdge.transaction.destinationAccountId
                    );
                });
            bankGraphEdge.destinationBankGraphNode.incomingBankGraphEdges =
                bankGraphEdge.destinationBankGraphNode.incomingBankGraphEdges.filter((bankGraphEdge) => {
                    return !(
                        bankGraphEdge.transaction.sourceAccountId == bankGraphEdge.transaction.sourceAccountId &&
                        bankGraphEdge.transaction.destinationAccountId == bankGraphEdge.transaction.destinationAccountId
                    );
                });

            this.graphService.removeEdge(bankGraphEdge.transactionEdge.id);
            this.bankGraphEdges.delete(bankGraphEdge.transaction.transactionId);
        }
    }

    public expandAccount(accountId: number) {
        const bankGraphNode = this.bankGraphNodes.get(accountId);

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
                    const accountAdded = this.addAccountById(transaction.destinationAccountId, expandedNodePos);
                    accountsAdded.push(accountAdded);
                    accountAdded.subscribe((created) => {
                        this.addTransaction(transaction);
                    });
                }
                apiCallResolved.next(forkJoin(accountsAdded));
            });
        }

        return apiCallResolved;
    }

    public expandAndLayoutAccount(accountId: number, ignoreAccountLayout: number[]) {
        const accountsExpanded = new ReplaySubject<AccountCreation[]>();
        const bankGraphNode = this.bankGraphNodes.get(accountId);

        if (bankGraphNode) {
            this.expandAccount(accountId).subscribe((accountsAddedObservable) => {
                accountsAddedObservable.subscribe((accountCreationData) => {
                    const pureAccountCreationData = accountCreationData.slice(1) as AccountCreation[];
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
        expansionQueue: {depth: number; accountId: number}[],
        expandedAccounts: number[],
        ignoreAccountLayout: number[]
    ) {
        const expansionData = expansionQueue.shift();
        if (expansionData) {
            expandedAccounts.push(expansionData.accountId);
            this.expandAndLayoutAccount(expansionData.accountId, ignoreAccountLayout).subscribe(
                (accountCreationData) => {
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
                    this.expandAccountInDepthQueue(expansionQueue, expandedAccounts, ignoreAccountLayout);
                }
            );
        }
    }

    public expandAccountInDepth(accountId: number, depth: number) {
        if (depth == 0) return;
        this.expandAccountInDepthQueue([{accountId: accountId, depth: depth}], [], [accountId]);
    }
}
