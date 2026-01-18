export interface Product {
  productId: number;
  sku: string;
  barcode?: string;
  name: string;
  categoryId?: number;
  categoryName: string;
  brandId?: number;
  brandName?: string;
  primaryUOMId?: number;
  primaryUOMName: string;
  standardCost: number;
  reorderPoint: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  status: string;
  thumbnailUrl?: string;
  totalQuantityOnHand?: number;
  totalQuantityAvailable?: number;
  createdDate?: Date;
}

export interface ProductDetail extends Product {
  description?: string;
  barcode?: string;
  weight?: number;
  weightUOM?: string;
  dimensions?: string;
  shelfLife?: number;
  storageConditions?: string;
  specifications?: string;
  imageUrl?: string;
  msrp?: number;
  images?: ProductImage[];
  suppliers?: ProductSupplier[];
}

export interface ProductImage {
  productImageId: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductSupplier {
  productSupplierId: number;
  supplierId: number;
  supplierName: string;
  supplierPartNumber?: string;
  unitCost: number;
  leadTimeDays: number;
  isPrimary: boolean;
}

export interface CreateProduct {
  sku: string;
  name: string;
  categoryId: number;
  brandId?: number;
  primaryUOMId: number;
  standardCost: number;
  msrp?: number;
  reorderPoint: number;
  minStockLevel: number;
  maxStockLevel: number;
  description?: string;
  barcode?: string;
}

export interface UpdateProduct extends CreateProduct {
  productId: number;
  status: ProductStatus;
}

export interface ProductFilter {
  search?: string;
  categoryId?: number;
  brandId?: number;
  status?: string;
  lowStockOnly?: boolean;
  pageNumber: number;
  pageSize: number;
}

export enum ProductStatus {
  Draft = 'Draft',
  Active = 'Active',
  Discontinued = 'Discontinued',
  OnHold = 'OnHold'
}
