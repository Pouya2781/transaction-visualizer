import {TransactionType} from '../enums/transaction-type';

export interface Transaction {
    sourceId: number;
    destinationId: number;
    amount: number;
    date: Date;
    transactionID: number;
    transactionType: TransactionType;
}
