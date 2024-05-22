import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap, first } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = localStorage.getItem('accessToken'); // Use accessToken for authorization

    // Clone the request to include the authorization header.
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Check if the error status is 401 and the error is due to token expiration
        if (error.status === 401 && error.error.message === 'jwt expired') {
          return this.handle401Error(req, next);
        } else {
          return throwError(error);
        }
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.refreshToken().pipe(
      switchMap((tokens: any) => {
        // Store the new tokens if necessary
        localStorage.setItem('accessToken', tokens.accessToken);
        // Clone the request with the new token
        const clonedRequest = request.clone({
          headers: request.headers.set('Authorization', `Bearer ${tokens.accessToken}`)
        });
        return next.handle(clonedRequest);
      }),
      first()
    );
  }
}
