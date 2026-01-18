import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <span class="logo-icon">📦</span>
          <h1>StockFlow Pro</h1>
          <p>Enterprise Inventory Management</p>
        </div>

        <form #loginForm="ngForm" (ngSubmit)="onSubmit(loginForm)" class="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              [(ngModel)]="credentials.username"
              required
              autocomplete="username"
              [class.error]="error()"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="credentials.password"
              required
              autocomplete="current-password"
              [class.error]="error()"
            />
          </div>

          <div class="error-message" *ngIf="error()">
            {{ error() }}
          </div>

          <app-button
            type="submit"
            variant="primary"
            size="lg"
            [loading]="loading()"
            [disabled]="!loginForm.valid"
          >
            Sign In
          </app-button>
        </form>

        <div class="login-footer">
          <p>Demo credentials: admin / Password123!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      padding: 1rem;
    }

    .login-card {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
      padding: 2.5rem;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .login-header h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #1e293b;
    }

    .login-header p {
      margin: 0.5rem 0 0;
      color: #64748b;
      font-size: 0.875rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .form-group input {
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      font-size: 1rem;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-group input.error {
      border-color: #ef4444;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      text-align: center;
    }

    .login-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .login-footer p {
      margin: 0;
      color: #94a3b8;
      font-size: 0.75rem;
    }

    app-button {
      width: 100%;
    }
  `]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  credentials = {
    username: '',
    password: ''
  };

  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit(form: NgForm): void {
    if (!form.valid) return;

    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Invalid username or password');
      }
    });
  }
}
