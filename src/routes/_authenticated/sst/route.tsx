import { createFileRoute } from '@tanstack/react-router';
import { SSTDataQuery } from '@/components/sst-data-query';
import { SSTImageViewer } from '@/components/sst-image-viewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { sstApi, SSTStats } from '@/services/api';

export const Route = createFileRoute('/_authenticated/sst')({
  component: SSTDashboard,
});

function SSTDashboard() {
  const [stats, setStats] = useState<SSTStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await sstApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">海洋表面温度系统</h1>
        <p className="text-muted-foreground">
          查询和可视化全球海洋表面温度数据
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>数据记录总数</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-2xl font-bold">...</p>
            ) : (
              <p className="text-2xl font-bold">
                {stats?.temperature.total_records.toLocaleString() || '0'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>平均温度</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-2xl font-bold">...</p>
            ) : (
              <p className="text-2xl font-bold">
                {stats?.temperature.avg_temp.toFixed(2) || '0'}°C
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>温度范围</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm">...</p>
            ) : (
              <p className="text-sm">
                {stats?.temperature.min_temp.toFixed(2) || '0'}°C -{' '}
                {stats?.temperature.max_temp.toFixed(2) || '0'}°C
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>数据时间范围</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm">...</p>
            ) : (
              <p className="text-sm">
                {stats?.dateRange.earliest_date || '...'} 至{' '}
                {stats?.dateRange.latest_date || '...'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="query" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="query">温度数据查询</TabsTrigger>
          <TabsTrigger value="images">温度图像查看</TabsTrigger>
        </TabsList>

        <TabsContent value="query">
          <SSTDataQuery />
        </TabsContent>

        <TabsContent value="images">
          <SSTImageViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}