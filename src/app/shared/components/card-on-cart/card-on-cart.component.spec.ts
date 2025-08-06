import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardOnCartComponent } from './card-on-cart.component';

describe('CardOnCartComponent', () => {
  let component: CardOnCartComponent;
  let fixture: ComponentFixture<CardOnCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardOnCartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardOnCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
