export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  errorCode?: string;
  errors?: { [key: string]: string[] };
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface LookupDto {
  id: number;
  name: string;
  code?: string;
}
