export interface Category {
  categoryId: number;
  categoryCode: string;
  name: string;
  description?: string;
  parentCategoryId?: number;
  parentCategoryName?: string;
  fullPath?: string;
  level?: number;
  displayOrder?: number;
  imageUrl?: string;
  isActive: boolean;
  productCount?: number;
}

export interface CategoryDetail extends Category {
  childCategories?: Category[];
}

export interface CreateCategory {
  name: string;
  description?: string;
  parentCategoryId?: number;
}

export interface UpdateCategory {
  name: string;
  description?: string;
  parentCategoryId?: number;
  isActive: boolean;
}

export interface CategoryFilter {
  search?: string;
  parentCategoryId?: number;
  isActive?: boolean;
  pageNumber: number;
  pageSize: number;
}
