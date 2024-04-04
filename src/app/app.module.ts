import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {NZ_I18N} from 'ng-zorro-antd/i18n';
import {en_US} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import en from '@angular/common/locales/en';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {IconsProviderModule} from './icons-provider.module';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {MainComponent} from './main/main.component';
import {HeaderComponent} from './header/header.component';
import {NzInputModule} from 'ng-zorro-antd/input';
import {SwitchComponent} from './header/switch/switch.component';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {SearchboxComponent} from './header/searchbox/searchbox.component';
import {BankAccountComponent} from './graph/node/bank-account/bank-account.component';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzBadgeModule} from 'ng-zorro-antd/badge';
import {TransactionComponent} from './graph/edge/transcation/transaction.component';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {NzDrawerModule} from 'ng-zorro-antd/drawer';
import {DrawerComponent} from './drawer/drawer.component';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzButtonModule} from 'ng-zorro-antd/button';

registerLocaleData(en);

@NgModule({
    declarations: [
        AppComponent,
        MainComponent,
        HeaderComponent,
        SwitchComponent,
        SearchboxComponent,
        BankAccountComponent,
        TransactionComponent,
        DrawerComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        IconsProviderModule,
        NzLayoutModule,
        NzMenuModule,
        NzInputModule,
        NzSwitchModule,
        NzBadgeModule,
        NzIconModule,
        NzDividerModule,
        NzDropDownModule,
        NzDrawerModule,
        NzFormModule,
        NzButtonModule,
    ],
    providers: [{provide: NZ_I18N, useValue: en_US}],
    bootstrap: [AppComponent],
})
export class AppModule {}
