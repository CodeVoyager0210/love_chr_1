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

  // 健康检查
  healthCheck: async (): Promise<any> => {
    const response = await api.get('/health');
    return response.data;
  },
};