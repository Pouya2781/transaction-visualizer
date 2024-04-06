import {BankGraphNode} from '../models/bank-graph-node';

export interface AccountCreation {
    created: boolean;
    bankGraphNode: BankGraphNode;
}

export type PartialAccountCreationArray = [Partial<AccountCreation>, ...AccountCreation[]];
//todo to service nabashe