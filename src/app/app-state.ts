import { setOrderBy, setReceiver, setRowsToDisplay, toggleListLengthCounter, toggleRowIdColumn } from './transactions/transactions-settings/transactions-settings.actions';
import { State as State } from './types';

import {
  Action,
  createAction,
  createReducer,
  on,
  props,
} from '@ngrx/store';

export const setError = createAction(
  '[Error] Propagate an error globally.',
  props<{ error?: State['error']; }>()
);

export const INITIAL_STATE: State = {
  displayListLength: false,
  displayRowId: false,
  orderBy: {
    field: 'date',
    direction: 'desc'
  },
  receiver: 'tz1gfArv665EUkSg2ojMBzcbfwuPxAvqPvjo',
  rowsToDisplay: 10,
}

const _displayListLengthReducer = createReducer(INITIAL_STATE.displayListLength, on(
  toggleListLengthCounter, (state, { show }) => show ?? state)
);
const _displayRowIdReducer = createReducer(INITIAL_STATE.displayRowId, on(
  toggleRowIdColumn, (state, { show }) => show ?? state)
);
const _errorReducer = createReducer(INITIAL_STATE.error, on(
  setError, (state, { error }) => error === undefined ? state : error)
);
const _orderByReceiver = createReducer(INITIAL_STATE.orderBy, on(
  setOrderBy, (state, { orderBy }) => orderBy ?? state)
);
const _receiverReducer = createReducer(INITIAL_STATE.receiver, on(
  setReceiver, (state, { receiver }) => receiver ?? state)
);
const _rowsToDisplayReducer = createReducer(INITIAL_STATE.rowsToDisplay, on(
  setRowsToDisplay, (state, { amount }) => amount ?? state)
);

export function displayListLengthReducer(state: State['displayListLength'] | undefined, action: Action) {
  return _displayListLengthReducer(state, action);
}
export function displayRowIdReducer(state: State['displayRowId'] | undefined, action: Action) {
  return _displayRowIdReducer(state, action);
}
export function errorReducer(state: State['error'] | undefined, action: Action) {
  return _errorReducer(state, action);
}
export function orderByReceiver(state: State['orderBy'] | undefined, action: Action) {
  return _orderByReceiver(state, action);
}
export function receiverReducer(state: State['receiver'] | undefined, action: Action) {
  return _receiverReducer(state, action);
}
export function rowsToDisplayReducer(state: State['rowsToDisplay'] | undefined, action: Action) {
  return _rowsToDisplayReducer(state, action);
}

export const reducers = {
  displayListLength: displayListLengthReducer,
  displayRowId: displayRowIdReducer,
  error: errorReducer,
  orderBy: orderByReceiver,
  receiver: receiverReducer,
  rowsToDisplay: rowsToDisplayReducer
}