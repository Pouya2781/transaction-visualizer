import {Injectable} from '@angular/core';
import {PointLike, Node} from '@antv/x6';
import {Observable, ReplaySubject} from 'rxjs';
import {AccountCreation} from '../models/account-creation.type';
import {BankAccount} from '../models/bank-account.type';
import {ApiService} from './api.service';
import {NzModalService} from 'ng-zorro-antd/modal';
import {GraphService} from './graph.service';
import {BankGraphNode} from '../models/bank-graph-node.type';
import {TransactionService} from './transaction.service';
import {BankGraphEdge} from '../models/bank-graph-edge.type';

@Injectable({
    providedIn: 'root',
})
export class BankAccountService {
    public constructor(
        private readonly apiService: ApiService,
        private readonly modalService: NzModalService,
        private readonly graphService: GraphService,
        private readonly transactionService: TransactionService
    ) {}

    public addAccountById(
        bankGraphNodes: Map<number, BankGraphNode>,
        accountId: number,
        pos: PointLike,
        showModal: boolean
    ): Observable<Partial<AccountCreation>> {
        const replaySubject = new ReplaySubject<Partial<AccountCreation>>();
        let bankGraphNode: BankGraphNode | undefined = bankGraphNodes.get(accountId);
        if (bankGraphNode) {
            replaySubject.next({created: false, bankGraphNode});
            replaySubject.complete();
            return replaySubject;
        }
        this.apiService.getAccount(accountId).subscribe((bankAccount: BankAccount) => {
            if (!bankAccount) console.log(bankAccount);
            if (bankAccount) {
                bankGraphNode = this.addAccount(bankGraphNodes, bankAccount, pos);
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

    public addAccount(
        bankGraphNodes: Map<number, BankGraphNode>,
        bankAccount: BankAccount,
        pos: PointLike
    ): BankGraphNode {
        let bankGraphNode: BankGraphNode | undefined = bankGraphNodes.get(bankAccount.accountId);
        if (bankGraphNode) return bankGraphNode;

        const node: Node<Node.Properties> = this.graphService.addCustomNode({
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

        bankGraphNodes.set(bankAccount.accountId, bankGraphNode);
        return bankGraphNode;
    }

    public deleteAccount(
        bankGraphNodes: Map<number, BankGraphNode>,
        bankGraphEdges: Map<number, BankGraphEdge>,
        accountId: number
    ): void {
        const bankGraphNode: BankGraphNode | undefined = bankGraphNodes.get(accountId);

        if (!!bankGraphNode) {
            for (let bankAccountEdge of bankGraphNode.outgoingBankGraphEdges) {
                this.transactionService.deleteTransaction(bankGraphEdges, bankAccountEdge.transaction.transactionId);
            }
            for (let bankAccountEdge of bankGraphNode.incomingBankGraphEdges) {
                this.transactionService.deleteTransaction(bankGraphEdges, bankAccountEdge.transaction.transactionId);
            }

            bankGraphNodes.delete(bankGraphNode.bankAccount.accountId);
            this.graphService.removeNode(bankGraphNode.bankAccountNode.id);
        }
    }
}
