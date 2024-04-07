import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LiteModeService {
    private _liteMode: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    public get liteMode(): Observable<boolean> {
        return this._liteMode;
    }
    constructor() {}

    public setLiteMode(value: boolean) {
        this._liteMode.next(value);
    }
}
