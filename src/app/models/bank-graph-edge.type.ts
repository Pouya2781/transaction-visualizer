import {CustomEdge} from './edge.type';
import {Transaction} from './transaction.type';
import {BankGraphNode} from './bank-graph-node.type';

export interface BankGraphEdge {
    transaction: Transaction;
    transactionEdge: CustomEdge;
    sourceBankGraphNode: BankGraphNode;
    destinationBankGraphNode: BankGraphNode;
}
