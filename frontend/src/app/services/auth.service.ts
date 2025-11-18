import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    const token = this.getToken();
    // Buscar en ambos lugares (auth_user y user)
    const userStr =
      localStorage.getItem(this.userKey) || localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.clearAuth();
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.setAuth(response.data.user, response.data.token);
          }
        })
      );
  }

  register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.setAuth(response.data.user, response.data.token);
          }
        })
      );
  }

  loginWithMicrosoft(): void {
    window.location.href = `${this.apiUrl}/auth/microsoft`;
  }

  handleMicrosoftCallback(code: string): Observable<AuthResponse> {
    return this.http
      .get<AuthResponse>(`${this.apiUrl}/auth/microsoft/callback?code=${code}`)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.setAuth(response.data.user, response.data.token);
          }
        })
      );
  }

  async logout(): Promise<void> {
    console.log('[AuthService] logout() - START');

    try {
      // Limpiar localmente primero
      console.log('[AuthService] Calling clearAuth()');
      this.clearAuth();
      console.log('[AuthService] clearAuth() - COMPLETED');

      // Redirigir al login sin historial (para evitar volver atrás)
      console.log('[AuthService] Navigating to /login with replaceUrl: true');
      await this.router.navigate(['/login'], { replaceUrl: true });
      console.log('[AuthService] Navigation to /login COMPLETED');

      // Notificar al backend DESPUÉS de navegar (no bloqueante)
      console.log('[AuthService] Sending logout request to backend');
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/logout`, {}).subscribe({
        next: () => console.log('[AuthService] Logout exitoso en el servidor'),
        error: (error) =>
          console.error('[AuthService] Error en logout del servidor:', error),
      });
    } catch (error) {
      console.error('[AuthService] Error in logout():', error);
      // Asegurar que llegue a login incluso si hay error
      await this.router.navigate(['/login'], { replaceUrl: true });
    }

    console.log('[AuthService] logout() - END');
  }

  getMe(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/auth/me`);
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, {}).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.setToken(response.data.token);
        }
      })
    );
  }

  private setAuth(user: User, token: string): void {
    // Guardar en ambos formatos para compatibilidad
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private clearAuth(): void {
    console.log('[AuthService] clearAuth() - START');
    console.log('[AuthService] localStorage BEFORE clear:', {
      auth_token: localStorage.getItem(this.tokenKey),
      auth_user: localStorage.getItem(this.userKey),
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
    });

    // Limpiar todas las claves posibles
    console.log('[AuthService] Removing', this.tokenKey);
    localStorage.removeItem(this.tokenKey);
    console.log('[AuthService] Removing', this.userKey);
    localStorage.removeItem(this.userKey);
    console.log('[AuthService] Removing token');
    localStorage.removeItem('token');
    console.log('[AuthService] Removing user');
    localStorage.removeItem('user');

    console.log('[AuthService] localStorage AFTER clear:', {
      auth_token: localStorage.getItem(this.tokenKey),
      auth_user: localStorage.getItem(this.userKey),
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
    });

    console.log('[AuthService] Setting currentUserSubject to null');
    this.currentUserSubject.next(null);
    console.log(
      '[AuthService] currentUserSubject value:',
      this.currentUserSubject.value
    );
    console.log('[AuthService] clearAuth() - COMPLETED');
  }

  getToken(): string | null {
    // Buscar en ambos lugares (auth_token y token)
    return localStorage.getItem(this.tokenKey) || localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    if (this.currentUserSubject.value) {
      return this.currentUserSubject.value;
    }

    // Si no hay en memoria, buscar en localStorage
    const userStr =
      localStorage.getItem(this.userKey) || localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        return user;
      } catch (error) {
        return null;
      }
    }

    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
