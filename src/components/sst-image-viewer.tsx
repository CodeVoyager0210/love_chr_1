import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { sstApi, SSTImage } from '@/services/api';

export function SSTImageViewer() {
  const [startDate, setStartDate] = useState('2025-02-01');
  const [endDate, setEndDate] = useState('2025-02-28');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<SSTImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<SSTImage | null>(null);
  const [error, setError] = useState('');

  const handleQuery = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      params.limit = 100;

      const result = await sstApi.getSSTImages(params);
      if (result.length === 0) {
        setError('未找到图片，请调整日期范围');
      } else {
        setImages(result);
      }
    } catch (err) {
      setError('查询失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStartDate('2025-01-01');
    setEndDate('2025-07-31');
    handleQuery();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>全球海洋表面温度图</CardTitle>
          <CardDescription>查看全球海洋表面温度分布图</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="imgStartDate">开始日期</Label>
              <Input
                id="imgStartDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="imgEndDate">结束日期</Label>
              <Input
                id="imgEndDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleQuery} disabled={loading} className="w-full">
            {loading ? '查询中...' : '查询图片'}
          </Button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
      </Card>

      {images.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>图片列表</CardTitle>
              <CardDescription>
                共找到 {images.length} 张图片
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full">
                <div className="grid grid-cols-1 gap-2">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                        selectedImage?.id === img.id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{img.date}</span>
                        <Badge variant="outline">图片 ID: {img.id}</Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        查看
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {selectedImage && (
            <Card>
              <CardHeader>
                <CardTitle>温度图: {selectedImage.date}</CardTitle>
                <CardDescription>日期: {selectedImage.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-auto">
                  <img
                    src={`http://localhost:3000/api/sst-image/${selectedImage.id}`}
                    alt={selectedImage.date}
                    className="w-full h-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/800/400';
                      target.alt = '图片加载失败';
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}