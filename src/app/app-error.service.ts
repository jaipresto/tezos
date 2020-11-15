import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ErrorComponent } from './error/error.component';
import { State } from './types';


@Injectable({ providedIn: 'root' })
export class AppErrorService {

    error: State['error'];
    dialogRef: MatDialogRef<ErrorComponent> | null;

    constructor(
        store: Store<State>,
        dialog: MatDialog
    ) {
        store.select(state => state.error).subscribe(error => {
            if (error) {
                if (error.code !== this.error?.code) {
                    this.error = error;
                    this.dialogRef = dialog.open(ErrorComponent, {
                        panelClass: 'error-dialog-pane',
                        hasBackdrop: false,
                        disableClose: true,
                        data: { error }
                    });
                }
            }
            else {
                if (this.dialogRef) {
                    this.dialogRef.close();
                    this.error = null;
                    this.dialogRef = null;
                }
            }
        });
    }



}