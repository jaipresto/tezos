import { ComponentFixture, ComponentFixtureAutoDetect, fakeAsync, TestBed } from '@angular/core/testing';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientModule } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatGridListHarness, MatGridTileHarness } from '@angular/material/grid-list/testing';
import { Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonHarness } from '@angular/material/button/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { INITIAL_STATE } from '../app-state';
import { TransactionsComponent } from './transactions.component';
import { first, mapTo } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { ExampleTransaction, State } from '../types';
import { MaterialModule } from '../material.module';
import { FormsModule } from '@angular/forms';
import { TransactionsSettingsComponent } from './transactions-settings/transactions-settings.component';


const appTitle = 'Tezos';


describe('TransactionsComponent', () => {

  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;
  let el: HTMLElement;
  let loader: HarnessLoader;
  let mockStore: MockStore<State>;

  class TitleStub {
    title = appTitle;

    getTitle() {
      return this.title;
    }

    setTitle(title: string) {
      return this.title = title;
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ScrollingModule,
        HttpClientModule,
        FormsModule,
        MaterialModule
      ],
      declarations: [
        TransactionsComponent,
        TransactionsSettingsComponent
      ],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true }, // Enable (macro) automatic change detection.
        provideMockStore<State>({ initialState: INITIAL_STATE }),
        { provide: Title, useClass: TitleStub },
        { provide: MatDialog, useClass: MatDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    loader = TestbedHarnessEnvironment.loader(fixture);
    mockStore = TestBed.inject(MockStore);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    const title = TestBed.inject(Title);
    expect(title.getTitle()).toBe(appTitle + ' - View Transactions');
  });

  describe('settings button', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(TransactionsComponent);
      component = fixture.componentInstance;
      el = fixture.nativeElement;
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it(`should display`, fakeAsync(async () => {
      const settingsButton = await loader.getHarness(MatButtonHarness.with({ selector: '#settings-button' }));
      expect(settingsButton).toBeTruthy();
    }));

    it(`should call the openSettings method`, fakeAsync(async () => {
      component.openSettings = jasmine.createSpy('open settings', component.openSettings); // replace method with a spy to detect call
      const settingsButton = await loader.getHarness(MatButtonHarness.with({ selector: '#settings-button' }));
      await settingsButton.click('center');
      expect(component.openSettings).toHaveBeenCalledTimes(1);
    }));
  });

  it('should open settings dialog when method is called', fakeAsync(async () => {
    const dialog = component.openSettings();
    const opened = await lastValueFrom(dialog.afterOpened().pipe(mapTo(true)));
    dialog.close();
    expect(opened).toBeTrue();
  }));

  describe('refresh button', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(TransactionsComponent);
      component = fixture.componentInstance;
      el = fixture.nativeElement;
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should display the refresh button when the list is ordered by date-descending', fakeAsync(async () => {
      component.transactions.orderBy = {
        direction: 'desc',
        field: 'date'
      };
      const refreshButton = await loader.getHarness(MatButtonHarness.with({ selector: '#refresh-button' }));
      expect(refreshButton).toBeTruthy();
    }));

    it('should call checkForTransactions method', fakeAsync(async () => {
      component.transactions.orderBy = {
        direction: 'desc',
        field: 'date'
      };
      component.checkForTransactions = jasmine.createSpy('checkForTransactions');
      const refreshButton = await loader.getHarness(MatButtonHarness.with({ selector: '#refresh-button' }));
      await refreshButton.click();
      expect(component.checkForTransactions).toHaveBeenCalledTimes(1);
    }));
  })

  it('should NOT display the refresh button when the list is ordered any other way than by date-descending', fakeAsync(async () => {
    component.transactions.orderBy = {
      direction: 'asc',
      field: 'xtz'
    };
    let refreshButton;
    try {
      refreshButton = await loader.getHarness(MatButtonHarness.with({ selector: '#refresh-button' }));
    } catch (error) {

    }
    expect(refreshButton).toBeFalsy();
  }));

  it('properties should match corresponding initial state properties', fakeAsync(async () => {
    const initialState = await lastValueFrom(mockStore.pipe(first()));
    expect(component.displayListLength).toBe(initialState.displayListLength);
    expect(component.displayRowId).toBe(initialState.displayRowId);
    expect(component.orderBy.direction).toBe(initialState.orderBy.direction);
    expect(component.orderBy.field).toBe(initialState.orderBy.field);
    expect(component.rowsToDisplay).toBe(initialState.rowsToDisplay);
    expect(component.receiver).toBe(initialState.receiver);
  }));

  describe('Transactions list (CDK Viewport)', () => {
    let viewport: CdkVirtualScrollViewport;
    let streamedItems: ExampleTransaction[];

    beforeEach(async () => {
      viewport = component.viewport;
      streamedItems = await lastValueFrom(component.transactions['stream$'].pipe(first()));
    });

    it('should stream the fetched transactions', () => {
      expect(component.transactions.cache.length).toBe(streamedItems.length);
    });

    it('should display all streamed items', fakeAsync(async () => {
      const streamedItemsComponents = await loader.getAllHarnesses(MatGridListHarness.with({ selector: '.item' }));
      expect(streamedItemsComponents.length).toBe(streamedItems.length);
    }));

    it('should display row ID column if displayRowIdColumn is set to true', fakeAsync(async () => {
      component.displayRowId = true;

      const rowIdColumnHeader = await loader.getHarness(MatGridTileHarness.with({ selector: '#row-id-column-header' }));
      expect(rowIdColumnHeader).toBeTruthy()

      const columnsWithRowId = (await loader.getAllHarnesses(MatGridTileHarness.with({ selector: '.row-id-column' }))).length
      expect(columnsWithRowId).toBe(streamedItems.length);
    }));

    it('should NOT display row ID column if displayRowIdColumn is set to false', fakeAsync(async () => {
      component.displayRowId = false;

      let rowIdColumnHeader;
      try {
        rowIdColumnHeader = await loader.getHarness(MatGridTileHarness.with({ selector: '#row-id-column-header' }));
      } catch (error) {

      }
      expect(rowIdColumnHeader).toBeFalsy();

      let columnsWithRowId;
      try {
        columnsWithRowId = (await loader.getAllHarnesses(MatGridTileHarness.with({ selector: '.row-id-column' }))).length;
      } catch (error) {

      }
      expect(columnsWithRowId).toBeFalsy();
    }));

    it('should attempt to fetch more transactions when user scrolls to end', fakeAsync(async () => {
      const maxTransactionsToFetch = component.rowsToDisplay;
      let viewportItemsLengthBefore: number;
      let viewportItemsLengthAfter: number;

      viewportItemsLengthBefore = viewport.getDataLength(); // Get number of items in viewport before first manual scroll.
      viewport.scrollTo({ bottom: 0 }); // Scroll to bottom of lise.
      await lastValueFrom(component.transactions['stream$'].pipe(first())); // Wait for the stream to emit transactions.
      viewportItemsLengthAfter = viewport.getDataLength(); // Get number of items in viewport.
      expect(viewportItemsLengthAfter).toBeGreaterThanOrEqual(viewportItemsLengthBefore);
      expect(viewportItemsLengthAfter - viewportItemsLengthBefore).toBeLessThanOrEqual(maxTransactionsToFetch); // Ensure only necessary transactions were fetched.

      viewportItemsLengthBefore = viewportItemsLengthAfter;
      viewport.scrollTo({ bottom: 0 });
      await lastValueFrom(component.transactions['stream$'].pipe(first()));
      viewportItemsLengthAfter = viewport.getDataLength();
      expect(viewportItemsLengthAfter).toBeGreaterThanOrEqual(viewportItemsLengthBefore);
      expect(viewportItemsLengthAfter - viewportItemsLengthBefore).toBeLessThanOrEqual(maxTransactionsToFetch);

      viewportItemsLengthBefore = viewportItemsLengthAfter;
      viewport.scrollTo({ bottom: 0 });
      await lastValueFrom(component.transactions['stream$'].pipe(first()));
      viewportItemsLengthAfter = viewport.getDataLength();
      expect(viewportItemsLengthAfter).toBeGreaterThanOrEqual(viewportItemsLengthBefore);
      expect(viewportItemsLengthAfter - viewportItemsLengthBefore).toBeLessThanOrEqual(maxTransactionsToFetch);
    }), 60000);

    it('should contain no duplicates', fakeAsync(async () => {
      viewport.scrollTo({ bottom: 0 }); // Scroll to bottom.
      await lastValueFrom(component.transactions['stream$'].pipe(first())); // Wait for stream to emit transactions.
      viewport.scrollTo({ bottom: 0 });
      await lastValueFrom(component.transactions['stream$'].pipe(first()));
      viewport.scrollTo({ bottom: 0 });
      await lastValueFrom(component.transactions['stream$'].pipe(first()));
      viewport.scrollTo({ bottom: 0 });
      await lastValueFrom(component.transactions['stream$'].pipe(first()));
      viewport.scrollTo({ bottom: 0 });
      const items = await lastValueFrom(component.transactions['stream$'].pipe(first()));

      const unique: number[] = [];
      let hasDuplicates = false;
      for (const id of items.map(i => i.rowId)) {
        if (unique.includes(id)) {
          hasDuplicates = true;
          break;
        }
        else unique.push(id);
      }

      expect(hasDuplicates).toBeFalse();
    }), 60000);

    it('should reload when orderBy.field changes', fakeAsync(async () => {

      // Simulate scrolls to populate list.
      viewport.scrollTo({ bottom: 0 });
      await lastValueFrom(component.transactions['stream$'].pipe(first()));
      viewport.scrollTo({ bottom: 0 });
      await lastValueFrom(component.transactions['stream$'].pipe(first()));
      viewport.scrollTo({ bottom: 0 });
      const listLengthBeforeChange = (await lastValueFrom(component.transactions['stream$'].pipe(first()))).length;

      // Mock state change by setting entire state.
      mockStore.setState({ ...INITIAL_STATE, orderBy: { field: 'xtz', direction: 'asc' } });

      const listLengthAfterChange = (await lastValueFrom(component.transactions['stream$'].pipe(first()))).length;

      expect(listLengthBeforeChange).toBeGreaterThan(listLengthAfterChange);
    }));
  });

});
