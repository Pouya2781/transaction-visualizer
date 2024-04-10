import {BankAccount} from './bank-account.type';
import {Node} from '@antv/x6';
import {BankGraphEdge} from './bank-graph-edge.type';

export interface BankGraphNode {
    bankAccount: BankAccount;
    bankAccountNode: Node<Node.Properties>;
    incomingBankGraphEdges: BankGraphEdge[];
    outgoingBankGraphEdges: BankGraphEdge[];
}
