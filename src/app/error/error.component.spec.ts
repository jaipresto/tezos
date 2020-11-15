import { ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ErrorComponent } from './error.component';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;
  let el: HTMLElement;

  const errorStub = {
    error: {
      message: 'test error message 1'
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ErrorComponent],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true }, // Enable (macro) automatic change detection.
        { provide: MAT_DIALOG_DATA, useValue: errorStub },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should have a heading of 'Something went wrong...'`, () => {
    const h2 = el.querySelector('h2');

    expect(h2?.textContent).toEqual('Something went wrong...')
  });

  it('should display new message on change', () => {
    const p = el.querySelector('p');

    expect(component.data.error.message).toEqual(errorStub.error.message); // Check stub is working.
    expect(p?.textContent).toEqual(component.data.error.message); // Check message is displaying in UI.

    const testMessage2 = 'test error message 2'; // Create new error message.
    errorStub.error.message = testMessage2; // Set message on stub.
    fixture.detectChanges();
    expect(component.data.error.message).toEqual(testMessage2); // Check change has propagated to component class.
    expect(p?.textContent).toEqual(component.data.error.message); // Check correct message is displayed in UI.

    const testMessage3 = 'test error message 3';
    errorStub.error.message = testMessage3;
    fixture.detectChanges();
    expect(component.data.error.message).toEqual(testMessage3);
    expect(p?.textContent).toEqual(component.data.error.message);
  });

});
