import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sstApi, SSTImage } from '@/services/api';
import { Download } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/sst-query')({
  component: SSTQuery,
});

function SSTQuery() {
  const [date, setDate] = useState('2025-01-15');
  const [sstImage, setSstImage] = useState<SSTImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  // 初始加载
  useEffect(() => {
    handleQuery();
  }, []);

  const handleQuery = async () => {
    if (!date) {
      setError('请选择日期');
      return;
    }

    setLoading(true);
    setError('');
    setSstImage(null);

    try {
      // 查询温度图片
      const imageResult = await sstApi.getSSTImages({
        startDate: date,
        endDate: date,
        limit: 1
      });

      setSstImage(imageResult[0] || null);

      if (!imageResult[0]) {
        setError('未找到该日期的温度分布图');
      }
    } catch (err: any) {
      setError(err.error || err.message || '查询失败');
    } finally {
      setLoading(false);
    }
  };

  // 下载图片功能
  const handleDownload = async () => {
    if (!sstImage) return;

    setDownloading(true);
    try {
      // 获取图片数据
      const response = await fetch(`http://localhost:3000/api/sst-image/${sstImage.id}`);
      const blob = await response.blob();

      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sst-${sstImage.date}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
      setError('下载失败，请重试');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">海面温度分布图</h1>

      <Card>
        <CardHeader>
          <CardTitle>选择日期</CardTitle>
          <CardDescription>
            查看指定日期的全球海洋表面温度分布图
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="date">日期</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min="2025-01-01"
              max="2025-07-31"
            />
          </div>

          <Button onClick={handleQuery} disabled={loading || !date} className="w-full">
            {loading ? '查询中...' : '查询温度分布图'}
          </Button>

          {error && <p className="text-red-500">{error}</p>}
        </CardContent>
      </Card>

      {sstImage && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>温度分布图 - {date}</CardTitle>
                <CardDescription>
                  全球海洋表面温度分布
                </CardDescription>
              </div>
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {downloading ? '下载中...' : '下载图片'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <img
                src={`http://localhost:3000/api/sst-image/${sstImage.id}`}
                alt={`温度分布图 ${date}`}
                className="w-full h-auto rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg width="800" height="400" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="800" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af"%3E图片加载失败%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>日期：{sstImage.date}</p>
              <p>图片 ID：{sstImage.id}</p>
              {sstImage.file_size && <p>文件大小：{(sstImage.file_size / 1024 / 1024).toFixed(2)} MB</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}