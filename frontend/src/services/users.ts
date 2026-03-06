import api from './api';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    reminderTime: string;
  };
  createdAt?: string;
}

export interface UpdateProfileData {
  name?: string;
  avatar?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    reminderTime?: string;
  };
}

export interface UpdatePreferencesData {
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  reminderTime?: string;
}

export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data.data.user as UserProfile;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.put('/users/profile', data);
    return response.data.data.user as UserProfile;
  },

  // Update user preferences
  updatePreferences: async (data: UpdatePreferencesData) => {
    const response = await api.put('/users/preferences', data);
    return response.data.data.preferences;
  },

  // Delete user account
  deleteAccount: async () => {
    const response = await api.delete('/users/account');
    return response.data.data;
  },
};
