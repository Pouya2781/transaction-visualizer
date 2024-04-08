import {Component, Input} from '@angular/core';
import {BankAccount} from '../../models/bank-account.type';

@Component({
    selector: 'app-drawer',
    templateUrl: './drawer.component.html',
    styleUrls: ['./drawer.component.scss'],
})
export class DrawerComponent {
    @Input() public bankAccount!: BankAccount;
}
