import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../types/user.type';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isLoggedIn$().pipe(
    map(isLoggedIn => {
      if (!isLoggedIn) {
        // Redirect to the login page with return URL
        return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
      }
      return true;
    })
  );
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.currentUserRole$().pipe(
    map(currentUserRole => {
      if (currentUserRole !== UserRole.ADMIN) {
        // Redirect to the home page with return URL
        return router.createUrlTree(['/home'], { queryParams: { returnUrl: state.url } });
      }
      return true;
    })
  );
};
