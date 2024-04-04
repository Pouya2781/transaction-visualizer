import {AccountType} from '../enums/account-type';

export interface BankAccount {
    ownerId: number;
    ownerName: string;
    ownerFamilyName: string;
    branchName: string;
    branchAddress: string;
    branchTelephone: number;
    accountType: AccountType;
    sheba: string;
    cardId: string;
    accountId: number;
}
