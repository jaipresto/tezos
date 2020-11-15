import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { lastValueFrom, Observable, Subject, timer, merge, of } from 'rxjs';
import { catchError, first, map, shareReplay, skipWhile, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppErrorService } from '../app-error.service';
import { INITIAL_STATE, setError } from '../app-state';
import { MarketTickerRaw, MarketTicker, ExampleTransaction, ExampleTransactionsResponse, State } from '../types';
import { TransactionsSettingsComponent } from './transactions-settings/transactions-settings.component';


const proxy = 'https://jaipreston-proxy.herokuapp.com';


function sortList(transactions: ExampleTransaction[], orderBy: State['orderBy']) {
  return transactions.sort((a, b) => {
    const field = orderBy.field;
    return orderBy.direction === 'asc' ? (a[field] < b[field] ? -1 : b[field] > a[field] ? 1 : 0) :
      (a[field] > b[field] ? -1 : b[field] < a[field] ? 1 : 0);
  });
}

function xtzToDollars(xtz: number, usdPrice: number) {
  return usdPrice ? Math.round(((usdPrice * xtz) + Number.EPSILON) * 100) / 100 : '(unavailable)'
}


@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

  @ViewChild('viewport', { static: true }) viewport: CdkVirtualScrollViewport;
  displayListLength: boolean;
  displayRowId: boolean;
  rowsToDisplay: number;
  transactions: Transactions;
  maxBufferItems = 3;
  hideViewport = true;

  constructor(
    title: Title,
    private store: Store<State>,
    private dialog: MatDialog,
    private injector: Injector
  ) {
    title.setTitle(`${title.getTitle()} - View Transactions`);
  }

  ngOnInit() {
    this.transactions = new Transactions(
      this.injector.get(HttpClient),
      this.store,
      this.injector.get(AppErrorService)
    );

    this.store.select(state => state.displayListLength).subscribe(x => this.displayListLength = x);
    this.store.select(state => state.displayRowId).subscribe(x => this.displayRowId = x);
    this.store.select(state => state.rowsToDisplay).subscribe(x => {
      if (this.rowsToDisplay && x !== this.rowsToDisplay) this.viewport.ngOnInit();
      this.rowsToDisplay = x;
    });

    this.viewport.setRenderedContentOffset(50, 'to-end');
  }

  get screen() {
    return window.screen.width < 768 ? 'mobile' : 'desktop';
  }
  get itemSize() {
    return (this.screen === 'mobile' && this.displayRowId) ? 70 : 50;
  }
  get receiver() { return this.transactions.receiver; };
  get orderBy() { return this.transactions.orderBy; };
  get listLength() { return this.transactions.cache.length; }
  get gridCols() { return this.displayRowId ? 4 : 3; }
  get listSizePixels() { return `${this.rowsToDisplay * this.itemSize}px`; }
  get displayRefreshButton() { return this.orderBy.direction === 'desc'; }
  get loadingBottom() { return this.transactions.loadingBottom; }
  get loadingTop() { return this.transactions.loadingTop; }
  get highlighted() { return this.transactions.highlighted; }

  trackByRowId(index: number, transaction: ExampleTransaction) {
    return transaction.rowId;
  }

  checkForTransactions() {
    return this.transactions.checkForNewEvent$.next(true);
  }

  openSettings() {
    return this.dialog.open(
      TransactionsSettingsComponent, {
      id: 'TransactionsSettingsComponent',
      autoFocus: false
    });
  }
}

export class Transactions extends DataSource<ExampleTransaction> {

  cache: ExampleTransaction[] = [];
  private oldestTransaction: number;
  private newestTransaction: number;
  private stream$ = new Subject<ExampleTransaction[]>();
  private latestPrice$ = timer(0, 1000 * 60 * 5).pipe(
    switchMap(() => this.fetchMarketTickers()),
    map(tickers => {
      const usd = tickers.filter(t => t.quote === 'USD')[0]; // Pick first found for USD
      if (this.cache.length) this.cache = this.cache.map(t => {
        t.dollars = xtzToDollars(t.xtz, usd.last).toLocaleString();
        return t;
      });
      return usd;
    }),
    shareReplay()
  );
  receiver = INITIAL_STATE.receiver;
  orderBy = INITIAL_STATE.orderBy;
  loadingBottom: boolean;
  loadingTop = true;
  highlighted: number;
  checkForNewEvent$ = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private store: Store<State>,
    private error: AppErrorService
  ) {
    super();

    merge(
      timer(0, 1000 * 60 * 60),
      this.checkForNewEvent$,
    ).pipe(skipWhile(() => !(this.orderBy.direction === 'desc' && this.orderBy.field === 'date')))
      .subscribe(async () => {
        this.highlighted = 0;

        this.loadingTop = true;
        const { transactions } = await this.fetch({
          greaterThan: this.newestTransaction,
          orderByDirection: this.orderBy.direction,
          receiver: this.receiver
        }),
          toAdd = this.cache.length ? transactions.filter(t => this.cache.findIndex(ct => ct.rowId === t.rowId) === -1) : transactions;

        if (toAdd.length) this.addToStream(toAdd, { orderBy: this.orderBy });
        this.loadingTop = false;
      });

    store.select(state => state.receiver).subscribe(async receiver => {
      if (this.receiver && this.receiver !== receiver) {
        this.receiver = receiver;
        this.addToStream((await this.fetch({
          receiver, orderByDirection: this.orderBy.direction
        })).transactions, { orderBy: this.orderBy, resetCache: true });
      }
    });

    store.select(state => state.orderBy).subscribe(async after => {
      const before = this.orderBy;
      this.orderBy = after;
      if (before.direction !== after.direction) {
        const { transactions } = await this.fetch({
          receiver: this.receiver, orderByDirection: after.direction
        });

        this.addToStream(transactions, { orderBy: after, resetCache: true });
      }
      if (before.field !== after.field) {
        sortList(this.cache, after);
        this.stream$.next(this.cache);
      }
    });
  }

  connect(cv: CollectionViewer) {
    cv.viewChange.subscribe(async range => {

      this.loadingBottom = true;
      let scrollBackTo = 0;

      // If items are inserted, lightly highlight the bottom item so user can keep track when list updates.
      if (this.orderBy.field !== 'date') scrollBackTo = this.cache[range.end - 9].rowId;

      if (range.end && range.end === this.cache.length) {
        const { transactions } = await this.fetch({
          orderByDirection: this.orderBy.direction,
          receiver: this.receiver,
          lessThan: this.orderBy.direction === 'desc' ? this.oldestTransaction : undefined,
          greaterThan: this.orderBy.direction === 'asc' ? this.newestTransaction : undefined
        });

        this.addToStream(transactions, { orderBy: this.orderBy });

        if (scrollBackTo) this.highlighted = scrollBackTo;

        this.loadingBottom = false;
      }
    });
    return this.stream$;
  }

  disconnect() {

  }

  private async fetch(options: { lessThan?: number; greaterThan?: number; receiver: string; orderByDirection: State['orderBy']['direction']; rowsToDisplay?: number }) {

    let transactions: ExampleTransaction[] = [];

    try {
      const latestPrice = await lastValueFrom(this.latestPrice$.pipe(first()));
      transactions = await lastValueFrom(
        (this.http.get(`${environment.production ? `${proxy}/` : ''}https://api.tzstats.com/tables/op?columns=row_id,time,type,sender,volume&receiver=${options.receiver}&type=transaction&limit=${options.rowsToDisplay || 10}${!options.greaterThan ? `&order=${options.orderByDirection}` : ''}${options?.lessThan ? `&cursor.lt=${options.lessThan}` : ''}${options?.greaterThan ? `&cursor.gt=${options.greaterThan}` : ''}`) as Observable<ExampleTransactionsResponse[]>).pipe(
          map(transactions => transactions.map(([rowId, date, type, senderAddress, xtz]) => ({
            rowId,
            date,
            dateFormatted: formatDate(date, 'MMM d y, h:mm', 'en-US'),
            senderAddress,
            senderAddressFormatted: `${senderAddress.slice(0, 2)}...${senderAddress.slice(-7)}`,
            xtz,
            dollars: xtzToDollars(xtz, latestPrice.last).toLocaleString(),
          } as ExampleTransaction))
          ),
          first()
        ));
      if (this.error?.error?.code === 'transactions-fetch-failure') {
        this.store.dispatch(setError({ error: null }));
      }
    } catch (e) {
      this.store.dispatch(setError({
        error: {
          code: 'transactions-fetch-failure',
          message: `Fetching transactions for receiver '${options.receiver}' failed. Please check for correctness, and retry.`,
          details: e.error?.errors ? e.error.errors[0] : e
        }
      }));
      console.error(e);
    }
    if (transactions.length) {
      if (options.orderByDirection === 'desc') {
        this.newestTransaction = transactions[0].rowId;
        this.oldestTransaction = transactions[transactions.length - 1].rowId;
      }
      else {
        this.newestTransaction = transactions[transactions.length - 1].rowId;
        this.oldestTransaction = transactions[0].rowId;
      }
    }
    return {
      transactions,
      ... this.newestTransaction ? { newest: this.newestTransaction } : false,
      ... this.oldestTransaction ? { newest: this.oldestTransaction } : false
    }
  }

  private fetchMarketTickers() {
    return lastValueFrom(
      (this.http.get(`${environment.production ? `${proxy}/` : ''}https://api.tzstats.com/markets/tickers`) as Observable<MarketTickerRaw[]>).pipe(
        map(tickers => tickers.map(({ n_trades: nTrades, volume_base: volumeBase, volume_quote: volumeQuote, ...ticker }) =>
          ({ nTrades, volumeBase, volumeQuote, ...ticker } as MarketTicker))
        ),
        catchError(err => {
          console.log(err);
          return of([{
            quote: 'USD',
            last: 0
          } as MarketTicker])
        })
      ));
  }

  private addToStream(transactions: ExampleTransaction[], options: { orderBy: State['orderBy']; resetCache?: boolean }) {
    if (options.resetCache) this.cache = [];
    this.cache.push(...transactions);
    if (options.orderBy.field !== 'date') sortList(this.cache, options.orderBy);
    this.stream$.next(this.cache);
    if (this.loadingTop) this.loadingTop = false;
  }

}
