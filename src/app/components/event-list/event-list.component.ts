import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { Event } from '../../types/event.type';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatPaginatorModule,
    CommonModule
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'date', 'description', 'location', 'actions'];
  dataSource = new MatTableDataSource<Event>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchTerm: string = '';

  constructor(private eventService: EventService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadEvents(): void {
    this.eventService.getEvents()
      .subscribe(events => {
        this.dataSource.data = events;
        console.log('Events loaded', this.dataSource.data);
      });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  bookEvent(event: Event) {
    if (!event.isBooked) {
      this.eventService.bookEvent(event.id)
        .subscribe({
          next: (response) => {
            console.log('Booking successful', response);
            this.cdr.detectChanges();
          },
          error: (error) => console.error('Booking failed', error)
        });
    }
  }
}
