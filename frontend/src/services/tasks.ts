import api from './api';

export interface Task {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  category?: {
    _id: string;
    name: string;
    color: string;
    icon?: string;
  } | string;
  isCompleted: boolean;
  completedAt?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  isRecurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrenceDays?: number[];
  streak?: {
    current: number;
    longest: number;
    lastCompletedDate?: string;
  };
  completionHistory?: Array<{
    date: string;
    completed: boolean;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  isRecurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrenceDays?: number[];
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  isCompleted?: boolean;
}

export const taskService = {
  // Get all tasks
  getTasks: async (params?: {
    category?: string;
    completed?: boolean;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/tasks', { params });
    return response.data.data.tasks as Task[];
  },

  // Get single task
  getTask: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data.task as Task;
  },

  // Create task
  createTask: async (data: CreateTaskData) => {
    const response = await api.post('/tasks', data);
    return response.data.data.task as Task;
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskData) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data.data.task as Task;
  },

  // Toggle task completion
  toggleTaskCompletion: async (id: string) => {
    const response = await api.patch(`/tasks/${id}/complete`);
    return response.data.data.task as Task;
  },

  // Delete task
  deleteTask: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data.data;
  },
};
