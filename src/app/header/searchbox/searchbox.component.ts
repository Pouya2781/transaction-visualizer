import {Component, EventEmitter, Output} from '@angular/core';

@Component({
    selector: 'app-searchbox',
    templateUrl: './searchbox.component.html',
    styleUrls: ['./searchbox.component.scss'],
})
export class SearchboxComponent {
    @Output() public search: EventEmitter<string> = new EventEmitter<string>();

    protected searchValue: string = '';

    protected onSearch(event: KeyboardEvent): void {
        if (event.key === 'Enter') this.search.emit(this.searchValue);
    }
}
