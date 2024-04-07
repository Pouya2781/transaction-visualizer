import {Injectable} from '@angular/core';
import {PointLike} from '@antv/x6';
import {Observable, ReplaySubject} from 'rxjs';
import {AccountCreation} from '../models/account-creation';
import {BankAccount} from '../models/bank-account';
import {BankGraphService} from './bank-graph.service';
import {ApiService} from './api.service';
import {NzModalService} from 'ng-zorro-antd/modal';
import {GraphService} from './graph.service';
import {BankGraphNode} from '../models/bank-graph-node';

@Injectable({
    providedIn: 'root',
})
export class BankAccountService {
    constructor(
        private readonly bankGraphService: BankGraphService,
        private readonly apiService: ApiService,
        private readonly modalService: NzModalService,
        private readonly graphService: GraphService
    ) {}

    public addAccountById(accountId: number, pos: PointLike, showModal: boolean): Observable<Partial<AccountCreation>> {
        const replaySubject = new ReplaySubject<Partial<AccountCreation>>();
        let bankGraphNode = this.bankGraphService.bankGraphNodes.get(accountId);
        if (bankGraphNode) {
            replaySubject.next({created: false, bankGraphNode});
            replaySubject.complete();
            return replaySubject;
        }
        this.apiService.getAccount(accountId).subscribe((bankAccount: BankAccount) => {
            if (!bankAccount) console.log(bankAccount);
            if (bankAccount) {
                bankGraphNode = this.addAccount(bankAccount, pos);
                replaySubject.next({created: true, bankGraphNode});
            } else {
                replaySubject.next({created: false});
                if (showModal) {
                    this.modalService.warning({
                        nzTitle: 'حساب پیدا نشد',
                        nzContent: `!حسابی با شماره حساب ${accountId} وجود ندارد`,
                    });
                }
            }
            replaySubject.complete();
        });

        return replaySubject;
    }

    public addAccount(bankAccount: BankAccount, pos: PointLike): BankGraphNode {
        let bankGraphNode = this.bankGraphService.bankGraphNodes.get(bankAccount.accountId);
        if (bankGraphNode) return bankGraphNode;
        const node = this.graphService.addCustomNode({
            shape: 'custom-angular-component-node',
            x: pos.x,
            y: pos.y,
            data: {
                ngArguments: {
                    bankAccount,
                    transactionCount: 0,
                },
            },
        });
        bankGraphNode = {
            bankAccount,
            bankAccountNode: node,
            incomingBankGraphEdges: [],
            outgoingBankGraphEdges: [],
        };
        this.bankGraphService.bankGraphNodes.set(bankAccount.accountId, bankGraphNode);
        return bankGraphNode;
    }

    public deleteAccount(accountID: number): void {
        const bankGraphNode = this.bankGraphService.bankGraphNodes.get(accountID);

        if (!!bankGraphNode) {
            for (let bankAccountEdge of bankGraphNode.outgoingBankGraphEdges) {
                this.bankGraphService.deleteTransaction(bankAccountEdge.transaction.transactionId);
            }
            for (let bankAccountEdge of bankGraphNode.incomingBankGraphEdges) {
                this.bankGraphService.deleteTransaction(bankAccountEdge.transaction.transactionId);
            }

            this.bankGraphService.bankGraphNodes.delete(bankGraphNode.bankAccount.accountId);
            this.graphService.removeNode(bankGraphNode.bankAccountNode.id);
        }
    }
}
