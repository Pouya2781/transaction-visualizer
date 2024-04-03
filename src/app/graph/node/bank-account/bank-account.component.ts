import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {DynamicNodeView, InterconnectedNode} from '../../../models/node.type';
import {AccountType} from 'src/app/enums/account-type';
import {NodeState} from 'src/app/enums/node-state';
import {GraphService} from '../../../services/graph.service';

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
    @Input() public ownerFamilyName!: string;
    @Input() public branchName!: string;
    @Input() public branchAddress!: string;
    @Input() public branchTelephone!: string;
    @Input() public accountType!: AccountType;
    @Input() public sheba!: string;
    @Input() public cardID!: string;
    @Input() public accountID!: string;
    protected readonly AccountType = AccountType;
    protected readonly NodeState = NodeState;

    public nodeState: NodeState = NodeState.NORMAL;

    constructor(
        private graphService: GraphService,
        private readonly changeDetector: ChangeDetectorRef
    ) {}

    ngAfterViewInit() {
        this.graphService.interConnectNode(this);
        this.graphService.setUpDynamicResize(this);
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
}
