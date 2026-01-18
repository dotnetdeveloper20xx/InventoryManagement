import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pagination-container">
      <div class="pagination-info">
        Showing {{ startItem() }} to {{ endItem() }} of {{ totalItems }} items
      </div>
      <div class="pagination-controls">
        <div class="page-size-selector">
          <label>Items per page:</label>
          <select [(ngModel)]="selectedPageSize" (ngModelChange)="onPageSizeChange($event)">
            <option *ngFor="let size of pageSizeOptions" [value]="size">{{ size }}</option>
          </select>
        </div>
        <div class="page-buttons">
          <button
            class="page-btn"
            [disabled]="currentPage === 1"
            (click)="goToPage(1)"
            title="First page"
          >
            ««
          </button>
          <button
            class="page-btn"
            [disabled]="currentPage === 1"
            (click)="goToPage(currentPage - 1)"
            title="Previous page"
          >
            «
          </button>
          <button
            *ngFor="let page of visiblePages()"
            class="page-btn"
            [class.active]="page === currentPage"
            (click)="goToPage(page)"
          >
            {{ page }}
          </button>
          <button
            class="page-btn"
            [disabled]="currentPage === totalPages()"
            (click)="goToPage(currentPage + 1)"
            title="Next page"
          >
            »
          </button>
          <button
            class="page-btn"
            [disabled]="currentPage === totalPages()"
            (click)="goToPage(totalPages())"
            title="Last page"
          >
            »»
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-top: 1px solid #e2e8f0;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .pagination-info {
      color: #64748b;
      font-size: 0.875rem;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .page-size-selector label {
      color: #64748b;
    }

    .page-size-selector select {
      padding: 0.25rem 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      outline: none;
    }

    .page-buttons {
      display: flex;
      gap: 0.25rem;
    }

    .page-btn {
      padding: 0.5rem 0.75rem;
      border: 1px solid #e2e8f0;
      background: white;
      cursor: pointer;
      font-size: 0.875rem;
      border-radius: 0.25rem;
      transition: all 0.15s;
    }

    .page-btn:hover:not(:disabled) {
      background-color: #f1f5f9;
      border-color: #cbd5e1;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-btn.active {
      background-color: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }
  `]
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [10, 25, 50, 100];
  @Input() maxVisiblePages = 5;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  selectedPageSize = this.pageSize;

  totalPages = computed(() => Math.ceil(this.totalItems / this.pageSize) || 1);

  startItem = computed(() => {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  });

  endItem = computed(() => {
    const end = this.currentPage * this.pageSize;
    return end > this.totalItems ? this.totalItems : end;
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage;
    const max = this.maxVisiblePages;

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const halfMax = Math.floor(max / 2);
    let start = current - halfMax;
    let end = current + halfMax;

    if (start < 1) {
      start = 1;
      end = max;
    } else if (end > total) {
      end = total;
      start = total - max + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(Number(size));
  }
}
