import {CustomEdge} from './edge.type';
import {Transaction} from './transaction';
import {BankGraphNode} from './bank-graph-node';

export interface BankGraphEdge {
    transaction: Transaction;
    transactionEdge: CustomEdge;
    sourceBankGraphNode: BankGraphNode;
    destinationBankGraphNode: BankGraphNode;
}
