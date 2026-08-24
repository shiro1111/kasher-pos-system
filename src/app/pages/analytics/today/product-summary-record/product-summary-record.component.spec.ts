import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSummaryRecordComponent } from './product-summary-record.component';

describe('ProductSummaryRecordComponent', () => {
  let component: ProductSummaryRecordComponent;
  let fixture: ComponentFixture<ProductSummaryRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductSummaryRecordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductSummaryRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
