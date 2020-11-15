import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { reducers } from './app-state';
import { TransactionsSettingsComponent } from './transactions/transactions-settings/transactions-settings.component';
import { FormsModule } from '@angular/forms';
import { ErrorComponent } from './error/error.component';
import { MaterialModule } from './material.module';


@NgModule({
  declarations: [
    AppComponent,
    TransactionsComponent,
    TransactionsSettingsComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ScrollingModule,
    FormsModule,
    MaterialModule,
    StoreModule.forRoot(reducers),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
