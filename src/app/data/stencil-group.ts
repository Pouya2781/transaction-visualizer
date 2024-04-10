import {StencilGroupData} from '../models/stencil-group-data.type';
import {AccountType} from '../enums/account-type';

export const STENCIL_GROUP_DATA: StencilGroupData[] = [
    {
        metaDatas: [
            {
                shape: 'custom-angular-component-node',
                width: 290,
                height: 80,
                data: {
                    ngArguments: {
                        bankAccount: {
                            ownerName: 'افسر',
                            ownerId: 1253664585,
                            ownerFamilyName: 'طباطبایی',
                            accountId: '6534454617',
                            branchName: 'گلوبندک',
                            branchAddress: 'تهران-خیابان خیام-بالاتر از چهارراه گلوبندک',
                            branchTelephone: '55638667',
                            sheba: 'IR120778801496000000198',
                            cardId: '6104335000000190',
                            accountType: AccountType.CURRENT,
                            transactionCount: 196,
                        },
                    },
                },
            },
        ],
        groupName: 'group1',
    },
    {
        metaDatas: [
            {
                shape: 'custom-angular-component-node',
                width: 290,
                height: 80,
                data: {
                    ngArguments: {
                        bankAccount: {
                            ownerName: 'افسر',
                            ownerId: 1253664585,
                            ownerFamilyName: 'طباطبایی',
                            accountId: '6534454617',
                            branchName: 'گلوبندک',
                            branchAddress: 'تهران-خیابان خیام-بالاتر از چهارراه گلوبندک',
                            branchTelephone: '55638667',
                            sheba: 'IR120778801496000000198',
                            cardId: '6104335000000190',
                            accountType: AccountType.DEPOSIT,
                            transactionCount: 196,
                        },
                    },
                },
            },
        ],
        groupName: 'group2',
    },
    {
        metaDatas: [
            {
                shape: 'custom-angular-component-node',
                width: 290,
                height: 80,
                data: {
                    ngArguments: {
                        bankAccount: {
                            ownerName: 'افسر',
                            ownerId: 1253664585,
                            ownerFamilyName: 'طباطبایی',
                            accountId: '6534454617',
                            branchName: 'گلوبندک',
                            branchAddress: 'تهران-خیابان خیام-بالاتر از چهارراه گلوبندک',
                            branchTelephone: '55638667',
                            sheba: 'IR120778801496000000198',
                            cardId: '6104335000000190',
                            accountType: AccountType.SAVINGS,
                            transactionCount: 196,
                        },
                    },
                },
            },
        ],
        groupName: 'group3',
    },
];
