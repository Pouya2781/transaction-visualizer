import {Component, Input, TemplateRef, ViewChild} from '@angular/core';
import {NzDrawerRef, NzDrawerService} from 'ng-zorro-antd/drawer';
import {AccountType} from '../enums/account-type';

@Component({
    selector: 'app-drawer',
    templateUrl: './drawer.component.html',
    styleUrls: ['./drawer.component.scss'],
})
export class DrawerComponent {
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

    constructor() {}
}
