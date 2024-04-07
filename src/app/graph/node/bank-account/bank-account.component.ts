import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {DynamicNodeView, InterconnectedNode} from '../../../models/node.type';
import {AccountType} from 'src/app/enums/account-type';
import {NodeState} from 'src/app/enums/node-state';
import {GraphService} from '../../../services/graph.service';
import {NzContextMenuService, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {BankGraphService} from '../../../services/bank-graph.service';
import {NzDrawerService} from 'ng-zorro-antd/drawer';
import {DrawerComponent} from '../../../drawer/drawer.component';
import {BankAccount} from '../../../models/bank-account';
import {LiteModeService} from '../../../services/lite-mode.service';

@Component({
    selector: 'app-bank-account',
    templateUrl: './bank-account.component.html',
    styleUrls: ['./bank-account.component.scss'],
})
export class BankAccountComponent implements AfterViewInit, DynamicNodeView, InterconnectedNode {
    private readonly CURRENT_ACCOUNT_BORDER_COLOR = 'red';
    private readonly DEPOSIT_ACCOUNT_BORDER_COLOR = 'green';
    private readonly SAVINGS_ACCOUNT_BORDER_COLOR = 'blue';

    protected readonly AccountType = AccountType;
    protected readonly NodeState = NodeState;

    @ViewChild('dynamicNodeView') dynamicNodeView!: ElementRef;
    @Input() public nodeId!: string;

    @Input() public bankAccount!: BankAccount;
    @Input() public transactionCount!: number;

    public nodeState: NodeState = NodeState.NORMAL;
    public selectionIndex: number = -1;

    constructor(
        private readonly graphService: GraphService,
        private readonly changeDetector: ChangeDetectorRef,
        private readonly nzContextMenuService: NzContextMenuService,
        private readonly bankGraphService: BankGraphService,
        private readonly drawerService: NzDrawerService,
        private readonly liteModeService: LiteModeService
    ) {
        this.liteModeService.liteMode.subscribe((value) => {
            if (value) this.nodeState = NodeState.TINY;
            else this.nodeState = NodeState.NORMAL;
        });
    }

    ngAfterViewInit(): void {
        this.graphService.setUpDynamicResize(this);
    }

    showDetail(): void {
        if (this.nodeState == NodeState.EXPANDED) this.nodeState = NodeState.NORMAL;
        else this.nodeState = NodeState.EXPANDED;
        this.changeDetector.detectChanges();
    }

    getBorderColor(): string {
        if (this.bankAccount.accountType == AccountType.CURRENT) return this.CURRENT_ACCOUNT_BORDER_COLOR;
        if (this.bankAccount.accountType == AccountType.DEPOSIT) return this.DEPOSIT_ACCOUNT_BORDER_COLOR;
        return this.SAVINGS_ACCOUNT_BORDER_COLOR;
    }

    contextMenu(event: MouseEvent, menu: NzDropdownMenuComponent): void {
        this.nzContextMenuService.create(event, menu);
    }

    onSelect(): void {
        this.selectionIndex = this.bankGraphService.requestSelection(this);
        this.changeDetector.detectChanges();
    }

    onDeselect(): void {
        this.bankGraphService.requestDeselection(this);
        this.selectionIndex = -1;
        this.changeDetector.detectChanges();
    }

    updateSelectionIndex(selectionIndex: number): void {
        this.selectionIndex = selectionIndex;
        this.changeDetector.detectChanges();
    }

    onExpand(depth: number): void {
        this.bankGraphService.expandAccountInDepth(this.bankAccount.accountId, depth);
    }

    onDelete(): void {
        if (this.selectionIndex != -1) this.bankGraphService.requestDeselection(this);
        this.bankGraphService.deleteAccount(this.bankAccount.accountId);
    }

    onDetail(): void {
        const drawerRef = this.drawerService.create({
            nzTitle: 'جزییات حساب',
            nzContent: DrawerComponent,
            nzContentParams: {
                bankAccount: this.bankAccount,
            },
        });

        drawerRef.afterOpen.subscribe(() => {
            console.log('Drawer(Template) open');
        });

        drawerRef.afterClose.subscribe(() => {
            console.log('Drawer(Template) close');
        });
    }
}
