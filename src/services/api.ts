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
  // SST数据查询API - 根据经纬度和日期查询
  getSSTData: async (params: {
    queryType?: 'exact' | 'range' | 'nearby';
    lat?: number;
    lon?: number;
    lat_min?: number;
    lat_max?: number;
    lon_min?: number;
    lon_max?: number;
    startDate?: string;
    endDate?: string;
    sst_min?: number;
    sst_max?: number;
    limit?: number;
    offset?: number;
    lastId?: number;
  }): Promise<{
    data: SSTData[];
    queryTime: string;
    count: number;
    total?: number;
    hasMore: boolean;
    nextId?: number;
    queryType: string;
    message?: string;
    isNearbyData?: boolean;
  }> => {
    const response = await api.get('/sst-data', { params });
    return response.data;
  },

  // SST统计聚合API
  getSSTStats: async (params?: {
    lat_min?: number;
    lat_max?: number;
    lon_min?: number;
    lon_max?: number;
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'month' | 'year';
  }): Promise<{
    data: Array<{
      period: string;
      record_count: number;
      avg_sst: number;
      min_sst: number;
      max_sst: number;
      std_sst: number;
    }>;
    count: number;
    groupBy: string;
  }> => {
    const response = await api.get('/sst-stats', { params });
    return response.data;
  },

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

  // 优化的精确SST查询API
  getSSTDataExact: async (params: {
    lat: number;
    lon: number;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: SSTData[];
    queryTime: string;
    count: number;
    parameters: {
      latitude: number;
      longitude: number;
      startDate?: string;
      endDate?: string;
      limit: number;
    };
    performance: {
      queryTimeMs: number;
      indexUsed: string;
      message: string;
    };
  }> => {
    const response = await api.get('/sst-exact', { params });
    return response.data;
  },

  // 下载CSV格式数据
  downloadSSTDataCSV: async (params: {
    lat: number;
    lon: number;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> => {
    const response = await api.get('/sst-exact', {
      params: { ...params, download: true },
      responseType: 'blob'
    });
    return response.data;
  },

  // 健康检查
  healthCheck: async (): Promise<any> => {
    const response = await api.get('/health');
    return response.data;
  },
};