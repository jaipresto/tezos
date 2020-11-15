import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { State } from 'src/app/types';
import { setRowsToDisplay, setOrderBy, setReceiver, toggleRowIdColumn, toggleListLengthCounter } from './transactions-settings.actions';


const ORDER_BY_OPTIONS = {
  field: [
    { label: 'Date', value: 'date' },
    { label: 'Amount', value: 'xtz' }
  ],
  direction: [
    { label: 'Ascending', value: 'asc' },
    { label: 'Descending', value: 'desc' },
  ]
} as const;
export type OrderByOptionsKey = keyof typeof ORDER_BY_OPTIONS;
export type OrderByOptionsValue = typeof ORDER_BY_OPTIONS[OrderByOptionsKey];

@Component({
  selector: 'app-transactions-settings',
  templateUrl: './transactions-settings.component.html',
  styleUrls: ['./transactions-settings.component.scss']
})
export class TransactionsSettingsComponent implements OnInit {

  editReceiver: boolean;
  orderByOptions = ORDER_BY_OPTIONS;
  state: State;

  constructor(
    private store: Store<State>,
    public dialogRef: MatDialogRef<TransactionsSettingsComponent>
  ) {
    store.subscribe(state => this.state = state);
  }

  ngOnInit() {

  }

  toggleListLengthCounter(show: boolean) {
    this.store.dispatch(toggleListLengthCounter({ show }));
  }

  toggleRowIdColumn(show: boolean) {
    this.store.dispatch(toggleRowIdColumn({ show }));
  }

  setReceiver(receiver: string) {
    this.store.dispatch(setReceiver({ receiver: receiver.trim() }));
  }

  setOrderBy(orderBy: State['orderBy']) {
    console.log(orderBy)
    this.store.dispatch(setOrderBy({ orderBy }));
  }

  setRowsToDisplay(size: number) {
    this.store.dispatch(setRowsToDisplay({ amount: size }));
  }

  close() {
    this.dialogRef.close();
  }
}
