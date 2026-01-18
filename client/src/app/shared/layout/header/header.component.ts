import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <button class="menu-btn" (click)="menuToggle.emit()">
        ☰
      </button>

      <div class="header-right">
        <div class="notifications">
          <button class="icon-btn">🔔</button>
        </div>
        <div class="user-menu">
          <span class="user-avatar">
            {{ getInitials() }}
          </span>
          <span class="user-name">{{ currentUser()?.firstName }}</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      height: 60px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
    }

    .menu-btn {
      display: none;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .icon-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: background 0.15s;
    }

    .icon-btn:hover {
      background: #f1f5f9;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background 0.15s;
    }

    .user-menu:hover {
      background: #f1f5f9;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-name {
      font-weight: 500;
      color: #1e293b;
    }

    @media (max-width: 768px) {
      .menu-btn {
        display: block;
      }

      .user-name {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);

  @Output() menuToggle = new EventEmitter<void>();

  currentUser = this.authService.currentUser;

  getInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  }
}
