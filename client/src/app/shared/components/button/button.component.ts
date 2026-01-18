import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [class]="getButtonClasses()"
      [disabled]="disabled || loading"
      (click)="onClick($event)"
    >
      <span *ngIf="loading" class="spinner"></span>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-weight: 500;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.15s;
      border: 1px solid transparent;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Sizes */
    button.sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }

    button.md {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    button.lg {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    }

    /* Variants */
    button.primary {
      background-color: #3b82f6;
      color: white;
    }

    button.primary:hover:not(:disabled) {
      background-color: #2563eb;
    }

    button.secondary {
      background-color: #64748b;
      color: white;
    }

    button.secondary:hover:not(:disabled) {
      background-color: #475569;
    }

    button.success {
      background-color: #22c55e;
      color: white;
    }

    button.success:hover:not(:disabled) {
      background-color: #16a34a;
    }

    button.danger {
      background-color: #ef4444;
      color: white;
    }

    button.danger:hover:not(:disabled) {
      background-color: #dc2626;
    }

    button.warning {
      background-color: #f59e0b;
      color: white;
    }

    button.warning:hover:not(:disabled) {
      background-color: #d97706;
    }

    button.ghost {
      background-color: transparent;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    button.ghost:hover:not(:disabled) {
      background-color: #f1f5f9;
    }

    .spinner {
      width: 1em;
      height: 1em;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;

  @Output() clicked = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }

  getButtonClasses(): string {
    return `${this.variant} ${this.size}`;
  }
}
