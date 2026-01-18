import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">📦</span>
          <span class="logo-text" *ngIf="!collapsed">StockFlow Pro</span>
        </div>
        <button class="collapse-btn" (click)="toggleCollapse.emit()">
          {{ collapsed ? '→' : '←' }}
        </button>
      </div>

      <nav class="sidebar-nav">
        <a
          *ngFor="let item of navItems"
          [routerLink]="item.route"
          routerLinkActive="active"
          class="nav-item"
          [title]="collapsed ? item.label : ''"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info" *ngIf="!collapsed && currentUser()">
          <span class="user-name">{{ currentUser()?.fullName }}</span>
          <span class="user-role">{{ currentUser()?.roleName }}</span>
        </div>
        <button class="logout-btn" (click)="logout()" [title]="collapsed ? 'Logout' : ''">
          <span class="nav-icon">🚪</span>
          <span class="nav-label" *ngIf="!collapsed">Logout</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 260px;
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      z-index: 100;
    }

    .sidebar.collapsed {
      width: 70px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 1.5rem;
    }

    .logo-text {
      font-size: 1.125rem;
      font-weight: 600;
      color: white;
      white-space: nowrap;
    }

    .collapse-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: background 0.15s;
    }

    .collapse-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: all 0.15s;
      margin: 0.25rem 0.5rem;
      border-radius: 0.375rem;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-item.active {
      background: #3b82f6;
      color: white;
    }

    .nav-icon {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
    }

    .nav-label {
      white-space: nowrap;
    }

    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 0.75rem;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-info {
      margin-bottom: 0.75rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 0.375rem;
    }

    .user-name {
      display: block;
      color: white;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .user-role {
      display: block;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.75rem;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.7);
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.15s;
    }

    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .sidebar.collapsed .logout-btn {
      justify-content: center;
      padding: 0.75rem;
    }
  `]
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  currentUser = this.authService.currentUser;

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '📊' },
    { label: 'Products', route: '/products', icon: '📦' },
    { label: 'Categories', route: '/categories', icon: '📁' },
    { label: 'Inventory', route: '/inventory', icon: '📋' },
    { label: 'Warehouses', route: '/warehouses', icon: '🏭' },
    { label: 'Suppliers', route: '/suppliers', icon: '🚚' },
    { label: 'Purchase Orders', route: '/purchase-orders', icon: '🛒' }
  ];

  logout(): void {
    this.authService.logout();
  }
}
