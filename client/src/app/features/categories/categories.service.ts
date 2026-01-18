import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { PaginatedResponse, LookupDto } from '../../core/models/api-response.model';
import { Category, CategoryDetail, CreateCategory, UpdateCategory, CategoryFilter } from '../../core/models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'categories';

  getCategories(filter: CategoryFilter): Observable<PaginatedResponse<Category>> {
    return this.api.getPaginated<Category>(this.endpoint, {
      search: filter.search,
      parentCategoryId: filter.parentCategoryId,
      isActive: filter.isActive,
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize
    });
  }

  getCategory(id: number): Observable<CategoryDetail> {
    return this.api.get<CategoryDetail>(`${this.endpoint}/${id}`);
  }

  createCategory(category: CreateCategory): Observable<Category> {
    return this.api.post<Category>(this.endpoint, category);
  }

  updateCategory(id: number, category: UpdateCategory): Observable<Category> {
    return this.api.put<Category>(`${this.endpoint}/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getLookup(): Observable<LookupDto[]> {
    return this.api.get<LookupDto[]>(`${this.endpoint}/lookup`);
  }
}
