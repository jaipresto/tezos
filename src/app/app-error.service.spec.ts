import { fakeAsync, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { INITIAL_STATE } from './app-state';
import { AppErrorService } from './app-error.service';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { lastValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';


describe('AppErrorService', () => {
  let service: AppErrorService;
  let mockStore: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatDialogModule
      ],
      providers: [
        provideMockStore({ initialState: INITIAL_STATE }),
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} }
      ]
    });

    mockStore = TestBed.inject(MockStore);
    service = TestBed.inject(AppErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should present dialog when error emitted from store', fakeAsync(async () => {
    expect(service.dialogRef).toBeFalsy();
    mockStore.setState({ error: { code: 'test-error' as any, message: 'this is a error test', details: [] } });
    await lastValueFrom(mockStore.pipe(first())); // Await emit from store.
    expect(service.dialogRef).toBeTruthy();
  }));

  it('should close dialog when error state is set to null', fakeAsync(async () => {
    expect(service.dialogRef).toBeFalsy();
    mockStore.setState({ error: { code: 'test-error' as any, message: 'this is a error test', details: [] } });
    await lastValueFrom(mockStore.pipe(first()));
    expect(service.dialogRef).toBeTruthy();

    mockStore.setState({ error: null });
    await lastValueFrom(mockStore.pipe(first()));

    expect(service.dialogRef).toBeFalsy(); // If dialogRef is falsy, dialog has already been closed.
  }));

});
