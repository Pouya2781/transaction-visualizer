import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BankAccount} from '../models/bank-account.type';
import {Transaction} from '../models/transaction.type';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private readonly BASE_URL: string = 'http://localhost:3000/';

    public constructor(private readonly httpClient: HttpClient) {}

    public getAccount(id: number): Observable<BankAccount> {
        return this.httpClient.get<BankAccount>(this.BASE_URL + 'accounts', {params: new HttpParams().set('id', id)});
    }

    public getIncomingTransaction(id: number): Observable<Transaction[]> {
        return this.httpClient.post<Transaction[]>(this.BASE_URL + 'accounts/incoming', {id});
    }

    public getOutgoingTransaction(id: number): Observable<Transaction[]> {
        return this.httpClient.post<Transaction[]>(this.BASE_URL + 'accounts/outgoing', {id});
    }
}
