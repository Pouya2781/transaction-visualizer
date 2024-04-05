import {Injectable} from '@angular/core';
import {Transaction} from '../models/transaction';
import {BankAccount} from '../models/bank-account';
import {BankGraphEdge} from '../models/bank-graph-edge';
import {GraphService} from './graph.service';
import {BankGraphNode} from '../models/bank-graph-node';
import {ApiService} from './api.service';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';
import {BankAccountComponent} from '../graph/node/bank-account/bank-account.component';

@Injectable({
    providedIn: 'root',
})
export class BankGraphService {
    private bankGraphNodes: Map<number, BankGraphNode>;
    private bankGraphEdges: Map<number, BankGraphEdge>;
    public liteMode: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private selectedComponents: BankAccountComponent[] = [];

    constructor(
        private readonly graphService: GraphService,
        private apiService: ApiService
    ) {
        this.bankGraphNodes = new Map<number, BankGraphNode>();
        this.bankGraphEdges = new Map<number, BankGraphEdge>();
    }

    public setLightMode(value: boolean) {
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

    public addAccountById(accountId: number): Observable<boolean> {
        const replaySubject = new ReplaySubject<boolean>();
        if (this.bankGraphNodes.get(accountId)) {
            replaySubject.next(false);
            replaySubject.complete();
            return replaySubject;
        }
        this.apiService.getAccount(accountId).subscribe((bankAccount: BankAccount) => {
            this.addAccount(bankAccount);
            replaySubject.next(true);
            replaySubject.complete();
        });

        return replaySubject;
    }

    public addAccount(bankAccount: BankAccount) {
        if (this.bankGraphNodes.get(bankAccount.accountId)) return;
        const node = this.graphService.addCustomNode({
            shape: 'custom-angular-component-node',
            x: 250,
            y: 250,
            data: {
                ngArguments: {
                    ...bankAccount,
                    transactionCount: 0,
                },
            },
        });
        this.bankGraphNodes.set(bankAccount.accountId, {
            bankAccount,
            bankAccountNode: node,
            incomingBankGraphEdges: [],
            outgoingBankGraphEdges: [],
        });
    }

    public addTransaction(transaction: Transaction) {
        if (this.bankGraphEdges.get(transaction.transactionId)) return;
        const sourceBankGraphNode = this.bankGraphNodes.get(transaction.sourceAccountId);
        const destinationBankGraphNode = this.bankGraphNodes.get(transaction.destinationAccountId);
        console.log(sourceBankGraphNode);
        console.log(destinationBankGraphNode);
        if (!!sourceBankGraphNode && !!destinationBankGraphNode) {
            const edge = this.graphService.addCustomEdge({
                shape: 'edge',
                source: sourceBankGraphNode.bankAccountNode,
                target: destinationBankGraphNode.bankAccountNode,
                router: {
                    name: 'manhattan',
                    args: {
                        padding: 50,
                    },
                },
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

    public expandAccount(accountId: number, depth: number) {
        if (depth == 0) return;
        const bankGraphNode = this.bankGraphNodes.get(accountId);
        console.log(bankGraphNode);
        if (bankGraphNode) {
            this.apiService.getOutgoingTransaction(accountId).subscribe((transactions) => {
                transactions.forEach((transaction) => {
                    this.addAccountById(transaction.destinationAccountId).subscribe((created) => {
                        this.addTransaction(transaction);
                        this.expandAccount(transaction.destinationAccountId, depth - 1);
                    });
                });
            });
        }
    }
}
