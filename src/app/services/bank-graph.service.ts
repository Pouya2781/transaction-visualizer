import {Injectable} from '@angular/core';
import {Transaction} from '../models/transaction';
import {BankAccount} from '../models/bank-account';
import {BankGraphEdge} from '../models/bank-graph-edge';
import {GraphService} from './graph.service';
import {BankGraphNode} from '../models/bank-graph-node';

@Injectable({
    providedIn: 'root',
})
export class BankGraphService {
    private bankGraphNodes: Map<number, BankGraphNode>;
    private bankGraphEdges: Map<number, BankGraphEdge>;

    constructor(private readonly graphService: GraphService) {
        this.bankGraphNodes = new Map<number, BankGraphNode>();
        this.bankGraphEdges = new Map<number, BankGraphEdge>();
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
        this.bankGraphNodes.set(bankAccount.accountID, {
            bankAccount,
            bankAccountNode: node,
            incomingBankGraphEdges: [],
            outgoingBankGraphEdges: [],
        });
    }

    public addTransaction(transaction: Transaction) {
        const sourceBankGraphNode = this.bankGraphNodes.get(transaction.sourceId);
        const destinationBankGraphNode = this.bankGraphNodes.get(transaction.destinationId);
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
            this.bankGraphEdges.set(transaction.transactionID, bankGraphEdge);
        }
    }

    public deleteAccount(accountID: number) {
        const bankGraphNode = this.bankGraphNodes.get(accountID);

        if (!!bankGraphNode) {
            for (let bankAccountEdge of bankGraphNode.outgoingBankGraphEdges) {
                this.deleteTransaction(bankAccountEdge.transaction.transactionID);
            }
            for (let bankAccountEdge of bankGraphNode.incomingBankGraphEdges) {
                this.deleteTransaction(bankAccountEdge.transaction.transactionID);
            }

            this.bankGraphNodes.delete(bankGraphNode.bankAccount.accountID);
            this.graphService.removeNode(bankGraphNode.bankAccountNode.id);
        }
    }

    public deleteTransaction(transactionID: number) {
        const bankGraphEdge = this.bankGraphEdges.get(transactionID);
        if (!!bankGraphEdge) {
            bankGraphEdge.sourceBankGraphNode.outgoingBankGraphEdges =
                bankGraphEdge.sourceBankGraphNode.outgoingBankGraphEdges.filter((bankGraphEdge) => {
                    return !(
                        bankGraphEdge.transaction.sourceId == bankGraphEdge.transaction.sourceId &&
                        bankGraphEdge.transaction.destinationId == bankGraphEdge.transaction.destinationId
                    );
                });
            bankGraphEdge.destinationBankGraphNode.incomingBankGraphEdges =
                bankGraphEdge.destinationBankGraphNode.incomingBankGraphEdges.filter((bankGraphEdge) => {
                    return !(
                        bankGraphEdge.transaction.sourceId == bankGraphEdge.transaction.sourceId &&
                        bankGraphEdge.transaction.destinationId == bankGraphEdge.transaction.destinationId
                    );
                });

            this.graphService.removeEdge(bankGraphEdge.transactionEdge.id);
            this.bankGraphEdges.delete(bankGraphEdge.transaction.transactionID);
        }
    }
}
