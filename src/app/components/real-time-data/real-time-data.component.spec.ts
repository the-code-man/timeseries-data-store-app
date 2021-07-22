import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealTimeDataComponent } from './real-time-data.component';

describe('RealTimeDataComponent', () => {
  let component: RealTimeDataComponent;
  let fixture: ComponentFixture<RealTimeDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RealTimeDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RealTimeDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
