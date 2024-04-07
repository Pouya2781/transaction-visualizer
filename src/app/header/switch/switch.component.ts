import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'app-switch',
    templateUrl: './switch.component.html',
    styleUrls: ['./switch.component.scss'],
})
export class SwitchComponent {
    @Input('defaultValue') public isChecked: boolean = false;

    @Output() public change: EventEmitter<boolean> = new EventEmitter<boolean>();

    protected onChange(value: boolean): void {
        this.change.emit(value);
    }

    protected onLabelClick(): void {
        this.isChecked = !this.isChecked;
        this.onChange(this.isChecked);
    }
}
