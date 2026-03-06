import api from './api';

export interface AnalyticsOverview {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  completionRate: number;
  totalCurrentStreak: number;
  longestStreak: number;
  tasksByCategory: Array<{
    category: {
      id: string;
      name: string;
      color: string;
      icon?: string;
    } | null;
    count: number;
    completed: number;
  }>;
}

export interface CompletionHistoryItem {
  taskId: string;
  taskTitle: string;
  date: string;
  completed: boolean;
}

export interface StreakData {
  taskId: string;
  taskTitle: string;
  category: any;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

export interface HeatmapData {
  date: string;
  count: number;
}

export const analyticsService = {
  // Get analytics overview
  getOverview: async () => {
    const response = await api.get('/analytics/overview');
    return response.data.data.overview as AnalyticsOverview;
  },

  // Get completion history
  getCompletionHistory: async (startDate?: string, endDate?: string) => {
    const params = startDate && endDate ? { startDate, endDate } : undefined;
    const response = await api.get('/analytics/history', { params });
    return response.data.data.completions as CompletionHistoryItem[];
  },

  // Get streak statistics
  getStreakStats: async () => {
    const response = await api.get('/analytics/streaks');
    return response.data.data.streaks as StreakData[];
  },

  // Get heatmap data
  getHeatmapData: async (year?: number) => {
    const params = year ? { year } : undefined;
    const response = await api.get('/analytics/heatmap', { params });
    return response.data.data as { year: number; heatmap: HeatmapData[] };
  },
};
