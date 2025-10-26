import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface SSTData {
  id?: number;
  latitude: number;
  longitude: number;
  date: string;
  sst: number;
  anom?: number;
  ice?: number;
  err?: number;
}

export interface SSTImage {
  id: number;
  date: string;
  file_size?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SSTStats {
  temperature: {
    min_temp: number;
    max_temp: number;
    avg_temp: number;
    total_records: number;
  };
  dateRange: {
    earliest_date: string;
    latest_date: string;
  };
}

export interface UserFeedback {
  id: number;
  user_name: string;
  user_email?: string;
  feedback_type: '功能建议' | '问题反馈' | '数据需求' | '其他';
  feedback_text: string;
  priority: '低' | '中' | '高';
  status: '待处理' | '处理中' | '已完成' | '已关闭';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
}

export const sstApi = {
  // SST图片相关API
  getSSTImages: async (params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<SSTImage[]> => {
    const response = await api.get('/sst-images', { params });
    return response.data;
  },

  // 获取统计信息
  getStats: async (): Promise<SSTStats> => {
    const response = await api.get('/stats');
    return response.data;
  },

  // 用户反馈相关API
  submitFeedback: async (feedback: {
    user_name: string;
    user_email?: string;
    feedback_type: '功能建议' | '问题反馈' | '数据需求' | '其他';
    feedback_text: string;
    priority?: '低' | '中' | '高';
  }): Promise<{ success: boolean; message: string; feedback_id: number }> => {
    const response = await api.post('/feedback', feedback);
    return response.data;
  },

  // 获取反馈列表（管理员功能）
  getFeedbackList: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    feedback_type?: string;
  }): Promise<{
    feedback: UserFeedback[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const response = await api.get('/feedback', { params });
    return response.data;
  },

  // 健康检查
  healthCheck: async (): Promise<any> => {
    const response = await api.get('/health');
    return response.data;
  },
};