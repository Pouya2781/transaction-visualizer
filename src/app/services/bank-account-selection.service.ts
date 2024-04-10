import {Injectable} from '@angular/core';
import {BankAccountComponent} from '../components/graph/node/bank-account/bank-account.component';
import {Observable, Subject} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class BankAccountSelectionService {
    private selectionCount: number = 2;
    private _selectedComponents: BankAccountComponent[] = [];
    private selection: Subject<number> = new Subject<number>();
    private deselection: Subject<number> = new Subject<number>();

    public get selectedComponents(): BankAccountComponent[] {
        return this._selectedComponents;
    }

    public get onSelection(): Observable<number> {
        return this.selection;
    }

    public get onDeselection(): Observable<number> {
        return this.deselection;
    }

    public init(selectionCount: number): void {
        this.selectionCount = selectionCount;
    }

    public requestSelection(component: BankAccountComponent): number {
        if (this._selectedComponents.length == this.selectionCount) return -1;
        this._selectedComponents.push(component);
        this.selection.next(this._selectedComponents.length - 1);
        return this._selectedComponents.length - 1;
    }

    public requestDeselection(component: BankAccountComponent): number {
        const selectionIndex: number = this._selectedComponents.indexOf(component);
        this._selectedComponents.splice(selectionIndex, 1);
        for (let i = selectionIndex; i < this._selectedComponents.length; i++) {
            this._selectedComponents[i].updateSelectionIndex(i);
        }

        this.deselection.next(selectionIndex);
        return selectionIndex;
    }
}
