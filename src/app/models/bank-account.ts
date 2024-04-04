import {AccountType} from '../enums/account-type';

export interface BankAccount {
    transactionCount: number;
    ownerName: string;
    ownerFamilyName: string;
    branchName: string;
    branchAddress: string;
    branchTelephone: string;
    accountType: AccountType;
    sheba: string;
    cardID: string;
    accountID: string;
}
