import {Injectable} from '@angular/core';
import {Transaction} from '../models/transaction';
import {BankAccount} from '../models/bank-account';
import {BankGraphEdge} from '../models/bank-graph-edge';
import {GraphService} from './graph.service';
import {BankGraphNode} from '../models/bank-graph-node';
import {ApiService} from './api.service';

@Injectable({
    providedIn: 'root',
})
export class BankGraphService {
    private bankGraphNodes: Map<number, BankGraphNode>;
    private bankGraphEdges: Map<number, BankGraphEdge>;

    constructor(
        private readonly graphService: GraphService,
        private apiService: ApiService
    ) {
        this.bankGraphNodes = new Map<number, BankGraphNode>();
        this.bankGraphEdges = new Map<number, BankGraphEdge>();
    }

    public addAccountById(accountId: number): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.apiService.getAccount(accountId).subscribe((bankAccount: BankAccount) => {
                this.addAccount(bankAccount);
                resolve(true);
            });
        });
    }

    public addAccount(bankAccount: BankAccount) {
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
                        side: 'right',
                    },
                },
                connector: {
                    name: 'jumpover',
                    args: {
                        type: 'arc',
                        size: 5,
                    },
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
        console.log(bankGraphNode);
        if (bankGraphNode) {
            this.apiService.getOutgoingTransaction(accountId).subscribe((transactions) => {
                transactions.forEach((transaction) => {
                    this.apiService.getAccount(transaction.destinationAccountId).subscribe((bankAccount) => {
                        this.addAccount(bankAccount);
                        this.addTransaction(transaction);
                    });
                });
            });
        }
    }
}
