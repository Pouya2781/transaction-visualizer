import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'app-switch',
    templateUrl: './switch.component.html',
    styleUrls: ['./switch.component.scss'],
})
export class SwitchComponent {
    @Input('defaultValue') public isChecked: boolean = false;
    @Output() change: EventEmitter<boolean> = new EventEmitter<boolean>();

    onChange(value: boolean) {
        this.change.emit(value);
    }
    onLabelClick() {
        this.isChecked = !this.isChecked;
        this.onChange(this.isChecked);
    }
}
