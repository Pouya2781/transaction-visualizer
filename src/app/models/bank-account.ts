import {AccountType} from '../enums/account-type';

export interface BankAccount {
    ownerName: string;
    ownerFamilyName: string;
    branchName: string;
    branchAddress: string;
    branchTelephone: number;
    accountType: AccountType;
    sheba: string;
    cardID: string;
    accountID: number;
}
