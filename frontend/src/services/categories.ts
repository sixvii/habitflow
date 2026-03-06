import api from './api';

export interface Category {
  _id: string;
  id?: string;
  name: string;
  color: string;
  icon?: string;
  taskCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryData {
  name: string;
  color: string;
  icon?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export const categoryService = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data.data.categories as Category[];
  },

  // Get single category
  getCategory: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data.data.category as Category;
  },

  // Create category
  createCategory: async (data: CreateCategoryData) => {
    const response = await api.post('/categories', data);
    return response.data.data.category as Category;
  },

  // Update category
  updateCategory: async (id: string, data: UpdateCategoryData) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data.data.category as Category;
  },

  // Delete category
  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data.data;
  },
};
