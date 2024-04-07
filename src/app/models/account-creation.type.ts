import {BankGraphNode} from './bank-graph-node.type';

export interface AccountCreation {
    created: boolean;
    bankGraphNode: BankGraphNode;
}

export type PartialAccountCreationArray = [Partial<AccountCreation>, ...AccountCreation[]];
