import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpParamsOptions} from '@angular/common/http';
import {log} from 'ng-zorro-antd/core/logger';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private readonly BASE_URL: string = 'http://localhost:3000/';
    constructor(private httpClient: HttpClient) {}

    public getAccount(id: string) {
        return this.httpClient.get(this.BASE_URL + 'accounts', {params: new HttpParams().set('id', id)});
    }

    public getIncomingTransaction(id: string) {
        return this.httpClient.post(this.BASE_URL + 'accounts/incoming', {id});
    }

    public getOutgoingTransaction(id: string) {
        return this.httpClient.post(this.BASE_URL + 'accounts/outgoing', {id});
    }
}
