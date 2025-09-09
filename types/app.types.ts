export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'USER' | 'SUPERADMIN';
  name?: string;
  email?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AuthResponse {
  user: User;
  token?: string;
}
 
export interface LoginCredentials {
  username: string;
  password: string;
}
 
export interface RegisterData extends LoginCredentials {
  name: string;
  email?: string;
}
 
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}