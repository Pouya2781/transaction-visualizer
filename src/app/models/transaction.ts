import {TransactionType} from '../enums/transaction-type';

export interface Transaction {
    sourceId: string;
    destinationId: string;
    amount: number;
    date: Date;
    transactionID: string;
    transactionType: TransactionType;
}
