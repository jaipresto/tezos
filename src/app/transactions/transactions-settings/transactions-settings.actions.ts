import { createAction, props } from '@ngrx/store';
import { State } from 'src/app/types';


export const setReceiver = createAction(
  '[Transactions] Set the Transactions list receiver.',
  props<{ receiver: string; }>()
);

export const setOrderBy = createAction(
  '[Transactions] Set which field and order the list is ordered by.',
  props<{ orderBy: State['orderBy'] }>()
);

export const setRowsToDisplay = createAction(
  '[Transactions] Set the maximum size of the list.',
  props<{ amount: number; }>()
);

export const toggleRowIdColumn = createAction(
  '[Transactions] Toggle the row ID colum.',
  props<{ show: boolean; }>()
);

export const toggleListLengthCounter = createAction(
  '[Transactions] Toggle the list length counter.',
  props<{ show: boolean; }>()
);

