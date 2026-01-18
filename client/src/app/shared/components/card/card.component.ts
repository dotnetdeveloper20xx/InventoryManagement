import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.no-padding]="noPadding">
      <div class="card-header" *ngIf="title || headerTemplate">
        <h3 class="card-title" *ngIf="title">{{ title }}</h3>
        <div class="card-actions">
          <ng-content select="[card-actions]"></ng-content>
        </div>
      </div>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      <div class="card-footer" *ngIf="hasFooter">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .card-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
    }

    .card-body {
      padding: 1.5rem;
    }

    .card.no-padding .card-body {
      padding: 0;
    }

    .card-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      background-color: #f8fafc;
      border-radius: 0 0 0.5rem 0.5rem;
    }
  `]
})
export class CardComponent {
  @Input() title?: string;
  @Input() noPadding = false;
  @Input() hasFooter = false;
  @Input() headerTemplate?: unknown;
}
