import {BankAccount} from './bank-account';
import {Node} from '@antv/x6';
import {BankGraphEdge} from './bank-graph-edge';

export interface BankGraphNode {
    bankAccount: BankAccount;
    bankAccountNode: Node<Node.Properties>;
    incomingBankGraphEdges: BankGraphEdge[];
    outgoingBankGraphEdges: BankGraphEdge[];
}
