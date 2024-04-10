import {Injectable} from '@angular/core';
import {Transaction} from '../models/transaction.type';
import {GraphService} from './graph.service';
import {BankGraphEdge} from '../models/bank-graph-edge.type';
import {BankGraphNode} from '../models/bank-graph-node.type';
import {CustomEdge} from '../models/edge.type';

@Injectable({
    providedIn: 'root',
})
export class TransactionService {
    public constructor(private readonly graphService: GraphService) {}

    public addTransaction(
        bankGraphNodes: Map<number, BankGraphNode>,
        bankGraphEdges: Map<number, BankGraphEdge>,
        transaction: Transaction
    ): void {
        if (bankGraphEdges.get(transaction.transactionId)) return;
        const sourceBankGraphNode: BankGraphNode | undefined = bankGraphNodes.get(transaction.sourceAccountId);
        const destinationBankGraphNode: BankGraphNode | undefined = bankGraphNodes.get(
            transaction.destinationAccountId
        );

        if (!!sourceBankGraphNode && !!destinationBankGraphNode) {
            const edge: CustomEdge = this.graphService.addCustomEdge({
                shape: 'edge',
                source: sourceBankGraphNode.bankAccountNode,
                target: destinationBankGraphNode.bankAccountNode,
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
                ngArguments: {transaction},
            });

            const bankGraphEdge: BankGraphEdge = {
                transaction,
                transactionEdge: edge,
                sourceBankGraphNode,
                destinationBankGraphNode,
            };

            sourceBankGraphNode.outgoingBankGraphEdges.push(bankGraphEdge);
            destinationBankGraphNode.incomingBankGraphEdges.push(bankGraphEdge);
            bankGraphEdges.set(transaction.transactionId, bankGraphEdge);
        }
    }

    public deleteTransaction(bankGraphEdges: Map<number, BankGraphEdge>, transactionId: number): void {
        const bankGraphEdge: BankGraphEdge | undefined = bankGraphEdges.get(transactionId);
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
            bankGraphEdges.delete(bankGraphEdge.transaction.transactionId);
        }
    }
}
