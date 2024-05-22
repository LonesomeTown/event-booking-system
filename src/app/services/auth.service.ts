import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment.dev';

interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string | null;
    role: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  tokens: {
    access: {
      token: string;
      expires: string;
    };
    refresh: {
      token: string;
      expires: string;
    };
  };
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface TokenResponse {
  token: string;
  expires: Date;
}

interface AuthTokensResponse {
  access: TokenResponse;
  refresh?: TokenResponse;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isLoggedIn = new BehaviorSubject<boolean>(false);
  private currentUserRole = new BehaviorSubject<string>('USER');
  private authTokens = new BehaviorSubject<AuthTokens | null>(null);

  constructor(private http: HttpClient) {
    this.initializeUser();
  }

  register(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post(`${this.apiUrl}/v1/auth/register`, body);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const body = { email, password };
    return this.http.post<LoginResponse>(`${this.apiUrl}/v1/auth/login`, body).pipe(
      tap(response => {
        this.isLoggedIn.next(true);
        this.currentUserRole.next(response.user.role);
        this.authTokens.next({
          accessToken: response.tokens.access.token,
          refreshToken: response.tokens.refresh.token
        });
        this.storeTokens(response.tokens);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', response.user.role);
      }),
      catchError(this.handleError)
    );
  }

  refreshToken(): Observable<AuthTokensResponse> {
    return this.http.post<AuthTokensResponse>(`${this.apiUrl}/v1/auth/refresh-tokens`, {
      'refreshToken': localStorage.getItem('refreshToken')
    }).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.access.token);
      }),
      catchError(this.handleError)
    );
  }

  private initializeUser(): void {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole') || 'USER';
    this.isLoggedIn.next(loggedIn);
    this.currentUserRole.next(role);
  }

  private storeTokens(tokens: { access: { token: string }, refresh: { token: string }}): void {
    localStorage.setItem('accessToken', tokens.access.token);
    localStorage.setItem('refreshToken', tokens.refresh.token);
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => {
        if (error.error instanceof ErrorEvent) {
            // Client-side or network error occurred
            console.error('An error occurred:', error.error.message);
            return new Error(`Client-side error: ${error.error.message}`);
        } else {
            // The backend returned an unsuccessful response code
            console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
            return new Error(`Server-side error: Code ${error.status}, Message: ${error.message}`);
        }
    });
  }

  logout(): void {
    this.isLoggedIn.next(false);
    this.currentUserRole.next('USER');

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');

    if (this.authTokens.value) {
      this.http.post<void>(`${this.apiUrl}/v1/auth/logout`, { refreshToken: this.authTokens.value.refreshToken })
        .subscribe({
          next: () => {
            console.log('Logged out successfully');
          },
          error: (error) => {
            console.error('Logout failed', error);
          }
        });
    }

    this.authTokens.next(null);
  }

  isLoggedIn$(): Observable<boolean> {
    return this.isLoggedIn.asObservable();
  }

  currentUserRole$(): Observable<string> {
    return this.currentUserRole.asObservable();
  }
}
