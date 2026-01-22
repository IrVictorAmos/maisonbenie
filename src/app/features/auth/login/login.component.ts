import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  twoFAForm!: FormGroup;
  
  isLoading = signal(false);
  showPassword = signal(false);
  showTwoFA = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  
  currentUserId: number | null = null;
  loginAttempts = signal(0);
  maxAttempts = 5;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    // Rediriger si déjà authentifié
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  private initializeForms(): void {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    this.twoFAForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Veuillez remplir tous les champs correctement');
      return;
    }

    if (this.loginAttempts() >= this.maxAttempts) {
      this.errorMessage.set('Trop de tentatives. Compte temporairement verrouillé.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const credentials = {
      login: this.loginForm.get('login')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(credentials).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading.set(false);

        if (response.success) {
          if (response.requires_2fa) {
            this.currentUserId = response.user_id || null;
            this.showTwoFA.set(true);
            this.successMessage.set('Veuillez entrer votre code 2FA');
            this.loginAttempts.set(0);
          } else {
            this.successMessage.set('Connexion réussie!');
            this.loginAttempts.set(0);
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1000);
          }
        } else {
          this.loginAttempts.update(count => count + 1);
          this.errorMessage.set(response.error || 'Erreur de connexion');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.loginAttempts.update(count => count + 1);
        this.errorMessage.set(error.error?.error || 'Erreur de connexion. Veuillez réessayer.');
      }
    });
  }

  onVerify2FA(): void {
    if (this.twoFAForm.invalid || !this.currentUserId) {
      this.errorMessage.set('Code 2FA invalide');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request = {
      user_id: this.currentUserId,
      code: this.twoFAForm.get('code')?.value
    };

    this.authService.verify2FA(request).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading.set(false);

        if (response.success) {
          this.successMessage.set('Authentification réussie!');
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        } else {
          this.errorMessage.set(response.error || 'Code 2FA invalide');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.error || 'Erreur lors de la vérification 2FA');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  backToLogin(): void {
    this.showTwoFA.set(false);
    this.twoFAForm.reset();
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  get loginFormControls() {
    return this.loginForm.controls;
  }

  get twoFAFormControls() {
    return this.twoFAForm.controls;
  }
}
