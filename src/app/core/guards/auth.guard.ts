import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  private platformId = inject(PLATFORM_ID);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    if (this.authService.isAuthenticated() && !this.authService.isTokenExpired()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.isAuthenticated() && !authService.isTokenExpired()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
