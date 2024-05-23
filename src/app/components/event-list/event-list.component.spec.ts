import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { EventListComponent } from './event-list.component';
import { EventService } from '../../services/event.service';
import { Event } from '../../types/event.type';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('EventListComponent', () => {
  let component: EventListComponent;
  let fixture: ComponentFixture<EventListComponent>;
  let eventService: jasmine.SpyObj<EventService>;

  const mockEvents: Event[] = [
    { id: 1, name: 'Event 1', date: new Date(), description: 'Description 1', location: 'Location 1', isBooked: false },
    { id: 2, name: 'Event 2', date: new Date(), description: 'Description 2', location: 'Location 2', isBooked: true }
  ];

  beforeEach(waitForAsync(() => {
    const eventServiceSpy = jasmine.createSpyObj('EventService', ['getEvents', 'bookEvent']);

    TestBed.configureTestingModule({
      imports: [
        EventListComponent,
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatTableModule,
        MatInputModule,
        MatButtonModule,
        MatPaginatorModule,
        HttpClientTestingModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: EventService, useValue: eventServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventListComponent);
    component = fixture.componentInstance;
    eventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load events', () => {
    eventService.getEvents.and.returnValue(of(mockEvents));
    component.loadEvents();
    expect(eventService.getEvents).toHaveBeenCalled();
    expect(component.dataSource.data).toEqual(mockEvents);
  });

  it('should apply filter', () => {
    component.dataSource.data = mockEvents;
    component.searchTerm = 'Event 1';
    component.applyFilter();
    expect(component.dataSource.filter).toBe('event 1');
  });

  it('should book event', () => {
    const eventToBook = mockEvents[0];
    eventService.bookEvent.and.returnValue(of(undefined));
    eventService.getEvents.and.returnValue(of(mockEvents));

    component.bookEvent(eventToBook);
    expect(eventService.bookEvent).toHaveBeenCalledWith(eventToBook.id);
  });

  it('should handle booking error', () => {
    const eventToBook = mockEvents[0];
    eventService.bookEvent.and.returnValue(throwError(() => new Error('Booking failed')));
    spyOn(console, 'error');

    component.bookEvent(eventToBook);
    expect(eventService.bookEvent).toHaveBeenCalledWith(eventToBook.id);
    expect(console.error).toHaveBeenCalledWith('Booking failed', jasmine.any(Error));
  });
});
