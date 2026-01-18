import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { PaginatedResponse, LookupDto } from '../../core/models/api-response.model';
import { Product, ProductDetail, CreateProduct, UpdateProduct, ProductFilter } from '../../core/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'products';

  getProducts(filter: ProductFilter): Observable<PaginatedResponse<Product>> {
    return this.api.getPaginated<Product>(this.endpoint, {
      search: filter.search,
      categoryId: filter.categoryId,
      brandId: filter.brandId,
      status: filter.status,
      lowStockOnly: filter.lowStockOnly,
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize
    });
  }

  getProduct(id: number): Observable<ProductDetail> {
    return this.api.get<ProductDetail>(`${this.endpoint}/${id}`);
  }

  createProduct(product: CreateProduct): Observable<Product> {
    return this.api.post<Product>(this.endpoint, product);
  }

  updateProduct(id: number, product: UpdateProduct): Observable<Product> {
    return this.api.put<Product>(`${this.endpoint}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getLookup(): Observable<LookupDto[]> {
    return this.api.get<LookupDto[]>(`${this.endpoint}/lookup`);
  }
}
