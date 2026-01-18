export interface User {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  roleId: number;
  roleName: string;
  defaultWarehouseId?: number;
  defaultWarehouseName?: string;
  isActive: boolean;
  isLocked: boolean;
  lastLoginDate?: Date;
  createdDate: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: Date;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
