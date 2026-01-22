import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface LoginRequest {
  login?: string;
  email?: string;
  password: string;
}

export interface Verify2FARequest {
  user_id: number;
  code: string;
}

export interface User {
  id: number;
  email: string;
  login: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role?: string;
  photo?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  requires_2fa?: boolean;
  user?: User;
  user_id?: number;
  token?: string;
  error?: string;
}

export interface VerifyResponse {
  success: boolean;
  user?: User;
  token_expires_in?: number;
  inactivity_expires_in?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private platformId = inject(PLATFORM_ID);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    if (isPlatformBrowser(this.platformId)) {
      const user = this.getUserFromStorage();
      const token = this.getTokenFromStorage();
      this.currentUserSubject.next(user);
      this.tokenSubject.next(token);
      this.isAuthenticatedSubject.next(!!token);
      this.verifyTokenOnInit();
    }
  }

  /**
   * Connexion avec email/login et mot de passe
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.success && response.token && !response.requires_2fa) {
          this.setToken(response.token);
          if (response.user) {
            this.setCurrentUser(response.user);
          }
        }
      })
    );
  }

  /**
   * Vérification du code 2FA
   */
  verify2FA(request: Verify2FARequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/verify-2fa`, request).pipe(
      tap((response) => {
        if (response.success && response.token) {
          this.setToken(response.token);
          if (response.user) {
            this.setCurrentUser(response.user);
          }
        }
      })
    );
  }

  /**
   * Vérifier le token actuel
   */
  verifyToken(): Observable<VerifyResponse> {
    const token = this.getTokenFromStorage();
    if (!token) {
      return new Observable((observer) => {
        observer.error('No token found');
      });
    }

    return this.http.get<VerifyResponse>(`${this.apiUrl}/verify`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Renouveler l'activité du token
   */
  refreshActivity(): Observable<{ success: boolean; token: string }> {
    const token = this.getTokenFromStorage();
    if (!token) {
      return new Observable((observer) => {
        observer.error('No token found');
      });
    }

    return this.http.post<{ success: boolean; token: string }>(
      `${this.apiUrl}/refresh-activity`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).pipe(
      tap((response) => {
        if (response.success && response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  /**
   * Déconnexion
   */
  logout(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/logout`,
      {}
    ).pipe(
      tap(() => {
        this.clearAuth();
      })
    );
  }

  /**
   * Définir le token et le stocker
   */
  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.tokenSubject.next(token);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Définir l'utilisateur courant
   */
  private setCurrentUser(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Récupérer le token du localStorage
   */
  private getTokenFromStorage(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Récupérer l'utilisateur du localStorage
   */
  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Vérifier le token au démarrage
   */
  private verifyTokenOnInit(): void {
    const token = this.getTokenFromStorage();
    if (token) {
      this.verifyToken().subscribe({
        next: (response) => {
          if (response.success && response.user) {
            this.setCurrentUser(response.user);
          }
        },
        error: () => {
          this.clearAuth();
        }
      });
    }
  }

  /**
   * Effacer les données d'authentification
   */
  private clearAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Obtenir l'utilisateur courant
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtenir le token
   */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Vérifier si le token est expiré
   */
  isTokenExpired(): boolean {
    const token = this.getTokenFromStorage();
    if (!token) return true;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }
}
