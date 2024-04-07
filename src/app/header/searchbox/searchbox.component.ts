import {Component, EventEmitter, Output} from '@angular/core';

@Component({
    selector: 'app-searchbox',
    templateUrl: './searchbox.component.html',
    styleUrls: ['./searchbox.component.scss'],
})
export class SearchboxComponent {
    @Output() search: EventEmitter<string> = new EventEmitter<string>();
    searchValue: string = '';

    onSearch(event: KeyboardEvent): void {
        if (event.key === 'Enter') this.search.emit(this.searchValue);
    }
}
