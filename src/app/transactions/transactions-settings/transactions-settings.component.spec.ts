import { ComponentFixture, ComponentFixtureAutoDetect, fakeAsync, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { lastValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';
import { State } from 'src/app/types';
import { INITIAL_STATE } from '../../app-state';
import { OrderByOptionsKey, TransactionsSettingsComponent } from './transactions-settings.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';


describe('TransactionsSettingsComponent', () => {
  let fixture: ComponentFixture<TransactionsSettingsComponent>;
  let component: TransactionsSettingsComponent;
  let el: HTMLElement;
  let loader: HarnessLoader;
  let harness: MatDialogHarness;
  let mockStore: MockStore<State>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MaterialModule,
        FormsModule
      ],
      declarations: [TransactionsSettingsComponent],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true }, // Enable (macro) automatic change detection.
        provideMockStore({ initialState: INITIAL_STATE }),
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionsSettingsComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    loader = TestbedHarnessEnvironment.loader(fixture);
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, MatDialogHarness);
    mockStore = TestBed.inject(MockStore);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'state' property set, with values matching the app state`, fakeAsync(async () => {
    const appState = await lastValueFrom(mockStore.pipe(first()));
    const state = component.state;

    expect(state.displayListLength).toBe(appState.displayListLength);
    expect(state.displayRowId).toBe(appState.displayRowId);
    expect(state.orderBy.direction).toBe(appState.orderBy.direction);
    expect(state.orderBy.field).toBe(appState.orderBy.field);
    expect(state.receiver).toBe(appState.receiver);
    expect(state.rowsToDisplay).toBe(appState.rowsToDisplay);
  }));

  it('should display five editable fields', () => {
    const fields = el.querySelectorAll('.field');
    expect(fields.length).toBe(5);
  });

  describe('orderBy settings', () => {
    let orderByOptionsKeys: OrderByOptionsKey[] = [];

    beforeEach(() => {
      fixture = TestBed.createComponent(TransactionsSettingsComponent);
      component = fixture.componentInstance;
      el = fixture.nativeElement;
      orderByOptionsKeys = Object.keys(component.orderByOptions) as OrderByOptionsKey[]
    });

    it(`should open dropdown menus for all 'orderBy' options (${orderByOptionsKeys.length})`, fakeAsync(async () => {
      for (const key of orderByOptionsKeys) {

        const selectHarness = await loader.getHarness(MatSelectHarness.with({ selector: `#order-by-${key}-input` }));
        (await selectHarness.host()).click('center');
        const dropdownOptions = await selectHarness.getOptions();

        let index = 0;
        for (const option of component.orderByOptions[key]) {
          expect(await dropdownOptions[index].getText()).toBe(option.label);
          index++;
        }
      }
    }));
  });

  it('should close when ok is clicked', fakeAsync(async () => {
    const closeButton = await loader.getHarness(MatButtonHarness.with({ selector: '#close-button' }));
    await closeButton.click();
    expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
  }));

});
