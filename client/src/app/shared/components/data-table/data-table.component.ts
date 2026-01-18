import { Component, Input, Output, EventEmitter, TemplateRef, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataColumnDirective } from './data-column.directive';
import { PaginationComponent } from '../pagination/pagination.component';
import { SpinnerComponent } from '../spinner/spinner.component';

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, SpinnerComponent],
  template: `
    <div class="data-table-container">
      <!-- Search and Actions Bar -->
      <div class="table-header" *ngIf="showSearch || headerTemplate">
        <div class="search-box" *ngIf="showSearch">
          <input
            type="text"
            [placeholder]="searchPlaceholder"
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
        <div class="header-actions">
          <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
        </div>
      </div>

      <!-- Loading Spinner -->
      <app-spinner *ngIf="loading"></app-spinner>

      <!-- Table -->
      <div class="table-wrapper" *ngIf="!loading">
        <table class="data-table">
          <thead>
            <tr>
              <th *ngIf="selectable" class="checkbox-column">
                <input
                  type="checkbox"
                  [checked]="allSelected"
                  (change)="toggleSelectAll($event)"
                />
              </th>
              <th
                *ngFor="let col of columns"
                [style.width]="col.width || 'auto'"
                [class.sortable]="col.sortable"
                (click)="col.sortable && onSort(col.field)"
              >
                {{ col.header }}
                <span *ngIf="col.sortable" class="sort-icon">
                  <span *ngIf="sortColumn === col.field">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </span>
              </th>
              <th *ngIf="actionsTemplate" class="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let row of data; let i = index"
              [class.selected]="isSelected(row)"
              (click)="onRowClick(row)"
            >
              <td *ngIf="selectable" class="checkbox-column">
                <input
                  type="checkbox"
                  [checked]="isSelected(row)"
                  (change)="toggleSelect(row, $event)"
                  (click)="$event.stopPropagation()"
                />
              </td>
              <td *ngFor="let col of columns">
                <ng-container *ngIf="col.template; else defaultCell">
                  <ng-container *ngTemplateOutlet="col.template; context: { $implicit: row, row: row, value: getNestedValue(row, col.field) }"></ng-container>
                </ng-container>
                <ng-template #defaultCell>
                  {{ getNestedValue(row, col.field) }}
                </ng-template>
              </td>
              <td *ngIf="actionsTemplate" class="actions-column">
                <ng-container *ngTemplateOutlet="actionsTemplate; context: { $implicit: row, row: row }"></ng-container>
              </td>
            </tr>
            <tr *ngIf="data.length === 0">
              <td [attr.colspan]="getColspan()" class="empty-row">
                {{ emptyMessage }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <app-pagination
        *ngIf="paginate && totalItems > 0"
        [currentPage]="currentPage"
        [totalItems]="totalItems"
        [pageSize]="pageSize"
        [pageSizeOptions]="pageSizeOptions"
        (pageChange)="onPageChange($event)"
        (pageSizeChange)="onPageSizeChange($event)"
      ></app-pagination>
    </div>
  `,
  styles: [`
    .data-table-container {
      width: 100%;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .search-box {
      position: relative;
      flex: 1;
      max-width: 300px;
    }

    .search-input {
      width: 100%;
      padding: 0.5rem 1rem 0.5rem 2.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.875rem;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .table-wrapper {
      overflow-x: auto;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    .data-table th,
    .data-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    .data-table th {
      background-color: #f8fafc;
      font-weight: 600;
      color: #475569;
      white-space: nowrap;
    }

    .data-table th.sortable {
      cursor: pointer;
      user-select: none;
    }

    .data-table th.sortable:hover {
      background-color: #f1f5f9;
    }

    .sort-icon {
      margin-left: 0.25rem;
      font-size: 0.75rem;
    }

    .data-table tbody tr {
      transition: background-color 0.15s;
    }

    .data-table tbody tr:hover {
      background-color: #f8fafc;
    }

    .data-table tbody tr.selected {
      background-color: #eff6ff;
    }

    .checkbox-column {
      width: 40px;
      text-align: center;
    }

    .actions-column {
      width: 120px;
      text-align: right;
    }

    .empty-row {
      text-align: center;
      color: #94a3b8;
      padding: 2rem !important;
    }
  `]
})
export class DataTableComponent<T> implements AfterContentInit {
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() selectable = false;
  @Input() paginate = true;
  @Input() showSearch = true;
  @Input() searchPlaceholder = 'Search...';
  @Input() emptyMessage = 'No data available';
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 0;
  @Input() pageSizeOptions = [10, 25, 50, 100];
  @Input() headerTemplate: TemplateRef<unknown> | null = null;
  @Input() actionsTemplate: TemplateRef<unknown> | null = null;

  @Output() search = new EventEmitter<string>();
  @Output() sort = new EventEmitter<SortEvent>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() selectionChange = new EventEmitter<T[]>();
  @Output() rowClick = new EventEmitter<T>();

  @ContentChildren(DataColumnDirective) columnDirectives!: QueryList<DataColumnDirective>;

  columns: DataColumnDirective[] = [];
  searchTerm = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedItems = new Set<T>();

  get allSelected(): boolean {
    return this.data.length > 0 && this.selectedItems.size === this.data.length;
  }

  ngAfterContentInit(): void {
    this.columns = this.columnDirectives.toArray();
    this.columnDirectives.changes.subscribe(() => {
      this.columns = this.columnDirectives.toArray();
    });
  }

  onSearch(): void {
    this.search.emit(this.searchTerm);
  }

  onSort(field: string): void {
    if (this.sortColumn === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = field;
      this.sortDirection = 'asc';
    }
    this.sort.emit({ column: field, direction: this.sortDirection });
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.data.forEach(item => this.selectedItems.add(item));
    } else {
      this.selectedItems.clear();
    }
    this.selectionChange.emit(Array.from(this.selectedItems));
  }

  toggleSelect(item: T, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedItems.add(item);
    } else {
      this.selectedItems.delete(item);
    }
    this.selectionChange.emit(Array.from(this.selectedItems));
  }

  isSelected(item: T): boolean {
    return this.selectedItems.has(item);
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  getNestedValue(obj: T, path: string): unknown {
    return path.split('.').reduce((o: unknown, p) => (o as Record<string, unknown>)?.[p], obj);
  }

  getColspan(): number {
    let count = this.columns.length;
    if (this.selectable) count++;
    if (this.actionsTemplate) count++;
    return count;
  }
}
