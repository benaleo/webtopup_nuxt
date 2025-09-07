import type { Ref } from 'vue';
import type { User } from '../types/app.types';

export interface AuthState {
  user: Ref<User | null>;
  isAuthenticated: Ref<boolean>;
  signIn: (credentials: { username: string; password: string }) => Promise<{ user: User }>;
  signOut: () => Promise<void>;
  register: (userData: { name: string; username: string; password: string }) => Promise<{ user: User }>;
}

export const useAuth = (): AuthState => {
  const user = useState<User | null>('user', () => null);
  const isAuthenticated = computed(() => !!user.value);

  const signIn = async (credentials: { username: string; password: string }) => {
    try {
      const data = await $fetch<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: credentials
      });
      user.value = data.user;
      return data;
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    }
  };

  const register = async (userData: { name: string; username: string; password: string }) => {
    try {
      const response = await $fetch<{ user: User }>('/api/auth/register', {
        method: 'POST',
        body: userData,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response?.user) {
        throw new Error('Registration failed - no user data received');
      }
      
      return response;
    } catch (error: any) {
      console.error('Registration error:', error);
      // Rethrow with proper error handling
      if (error.data) {
        throw new Error(error.data.message || 'Registration failed');
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      });
      user.value = null;
      await navigateTo('/cms/login');
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    signIn,
    signOut,
    register
  };
};

// Auto-import the composable
export default useAuth;
