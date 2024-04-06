import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {DynamicNodeView, InterconnectedNode} from '../../../models/node.type';
import {AccountType} from 'src/app/enums/account-type';
import {NodeState} from 'src/app/enums/node-state';
import {GraphService} from '../../../services/graph.service';
import {NzContextMenuService, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {BankGraphService} from '../../../services/bank-graph.service';
import {NzDrawerService} from 'ng-zorro-antd/drawer';
import {DrawerComponent} from '../../../drawer/drawer.component';
// todo public private methods and return values type 
@Component({
    selector: 'app-bank-account',
    templateUrl: './bank-account.component.html',
    styleUrls: ['./bank-account.component.scss'],
})
export class BankAccountComponent implements AfterViewInit, DynamicNodeView, InterconnectedNode {
    @ViewChild('dynamicNodeView') dynamicNodeView!: ElementRef;
    @Input() public nodeId: string = 'adsa';

    @Input() public transactionCount!: number;
    @Input() public ownerName!: string;
    @Input() public ownerId!: number;
    @Input() public ownerFamilyName!: string;
    @Input() public branchName!: string;
    @Input() public branchAddress!: string;
    @Input() public branchTelephone!: number;
    @Input() public accountType!: AccountType;
    @Input() public sheba!: string;
    @Input() public cardId!: string;
    @Input() public accountId!: number;
    protected readonly AccountType = AccountType;
    protected readonly NodeState = NodeState;

    public nodeState: NodeState = NodeState.NORMAL;
    public selectionIndex: number = -1;

    constructor(
        private graphService: GraphService,
        private readonly changeDetector: ChangeDetectorRef,
        private nzContextMenuService: NzContextMenuService,
        private bankGraphService: BankGraphService,
        private drawerService: NzDrawerService
    ) {
        this.bankGraphService.liteMode.subscribe((value) => {
            if (value) this.nodeState = NodeState.TINY;
            else this.nodeState = NodeState.NORMAL;
        });
    }

    ngAfterViewInit() {
        this.graphService.setUpDynamicResize(this); // todo dont do this ,never never never :) !!!!
    }

    showDetail() {
        if (this.nodeState == NodeState.EXPANDED) this.nodeState = NodeState.NORMAL;
        else this.nodeState = NodeState.EXPANDED;
        this.changeDetector.detectChanges();
    }

    getBorderColor() {
        if (this.accountType == AccountType.CURRENT) return 'red';
        if (this.accountType == AccountType.DEPOSIT) return 'green';
        return 'blue';
    }

    contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
        this.nzContextMenuService.create($event, menu);
    }

    onSelect() {
        this.selectionIndex = this.bankGraphService.requestSelection(this);
        this.changeDetector.detectChanges();
    }

    onDeselect() {
        this.bankGraphService.requestDeselection(this);
        this.selectionIndex = -1;
        this.changeDetector.detectChanges();
    }

    updateSelectionIndex(selectionIndex: number) {
        this.selectionIndex = selectionIndex;
        this.changeDetector.detectChanges();
    }

    onExpand(depth: number) {
        this.bankGraphService.expandAccountInDepth(this.accountId, depth);
    }

    onDelete() {
        this.bankGraphService.deleteAccount(this.accountId);
    }

    onDetail() {
        const drawerRef = this.drawerService.create({
            nzTitle: 'جزییات حساب',
            nzContent: DrawerComponent,
            nzContentParams: {
                transactionCount: this.transactionCount,
                ownerName: this.ownerName,
                ownerId: this.ownerId,
                ownerFamilyName: this.ownerFamilyName,
                branchName: this.branchName,
                branchAddress: this.branchAddress,
                branchTelephone: this.branchTelephone,
                accountType: this.accountType,
                sheba: this.sheba,
                cardId: this.cardId,
                accountId: this.accountId,
                // AccountType: this.AccountType,
            },
        });

        drawerRef.afterOpen.subscribe(() => {
            console.log('Drawer(Template) open');// todo log hazf beshe 
        });

        drawerRef.afterClose.subscribe(() => {
            console.log('Drawer(Template) close');
        });
    }
}
