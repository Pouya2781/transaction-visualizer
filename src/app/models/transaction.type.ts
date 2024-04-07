import {TransactionType} from '../enums/transaction-type';

export interface Transaction {
    sourceAccountId: number;
    destinationAccountId: number;
    amount: string;
    date: string;
    transactionId: number;
    type: TransactionType;
}
