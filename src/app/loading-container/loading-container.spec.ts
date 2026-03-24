import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingContainer } from './loading-container';

describe('LoadingContainer', () => {
  let component: LoadingContainer;
  let fixture: ComponentFixture<LoadingContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
