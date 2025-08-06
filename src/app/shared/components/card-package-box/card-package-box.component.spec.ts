import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPackageBoxComponent } from './card-package-box.component';

describe('CardPackageBoxComponent', () => {
  let component: CardPackageBoxComponent;
  let fixture: ComponentFixture<CardPackageBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPackageBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPackageBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
