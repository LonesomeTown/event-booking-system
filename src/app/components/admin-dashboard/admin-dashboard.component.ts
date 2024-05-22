import { Component } from '@angular/core';
import { EventService } from '../../services/event.service';
import { Event } from '../../types/event.type';
import { EventListComponent } from '../event-list/event-list.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    EventListComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CommonModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  newEvent = { name: '', description: '', date: new Date(), location: '' } as Omit<Event, 'id' | 'isBooked'>;

  constructor(private eventService: EventService) {}

  addEvent() {
    this.eventService.createEvent(this.newEvent).subscribe({
      next: (event) => {
        console.log('Event added', event);
        this.newEvent = { name: '', description: '', date: new Date(), location: '' }; // Reset the form
      },
      error: (error) => console.error('Error adding event', error)
    });
  }
}
