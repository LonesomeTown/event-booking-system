import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.dev';
import { Event } from '../types/event.type';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/v1/events`;

  constructor(private http: HttpClient) { }

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}`).pipe(
      catchError(this.handleError)
    );
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createEvent(eventData: Omit<Event, 'id' | 'isBooked'>): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, eventData).pipe(
      catchError(this.handleError)
    );
  }

  updateEvent(id: number, eventData: Partial<Event>): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}`, eventData).pipe(
      catchError(this.handleError)
    );
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  bookEvent (id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/book`, {}).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
      return throwError(() => new Error(`Client-side error: ${error.error.message}`));
    } else {
      console.error(`Backend returned code ${error.status}, body was: ${error.message}`);
      return throwError(() => new Error(`Server-side error: Code ${error.status}, Message: ${JSON.stringify(error)}`));
    }
  }
}
