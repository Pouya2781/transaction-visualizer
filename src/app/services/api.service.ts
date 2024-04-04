import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpParamsOptions} from '@angular/common/http';
import {log} from 'ng-zorro-antd/core/logger';
import {Observable} from 'rxjs';
import {BankAccount} from '../models/bank-account';
import {Transaction} from '../models/transaction';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private readonly BASE_URL: string = 'http://localhost:3000/';
    constructor(private httpClient: HttpClient) {}

    public getAccount(id: string): Observable<BankAccount> {
        return this.httpClient.get<BankAccount>(this.BASE_URL + 'accounts', {params: new HttpParams().set('id', id)});
    }

    public getIncomingTransaction(id: string): Observable<Transaction> {
        return this.httpClient.post<Transaction>(this.BASE_URL + 'accounts/incoming', {id});
    }

    public getOutgoingTransaction(id: string): Observable<Transaction> {
        return this.httpClient.post<Transaction>(this.BASE_URL + 'accounts/outgoing', {id});
    }
}
