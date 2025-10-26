import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { sstApi, SSTData } from '@/services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SSTDataQuery() {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SSTData[]>([]);
  const [error, setError] = useState('');

  const handleQuery = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (lat) params.lat = parseFloat(lat);
      if (lon) params.lon = parseFloat(lon);
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      params.limit = 500;

      const result = await sstApi.getSSTData(params);
      if (result.length === 0) {
        setError('未找到数据，请调整查询条件');
      } else {
        setData(result);
      }
    } catch (err) {
      setError('查询失败，请检查参数');
    } finally {
      setLoading(false);
    }
  };

  const chartData = data.map(item => ({
    date: item.date,
    temperature: item.sst
  })).reverse();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>海洋表面温度查询</CardTitle>
          <CardDescription>查询特定经纬度的历史温度数据</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lat">纬度</Label>
              <Input
                id="lat"
                type="number"
                step="0.01"
                placeholder="例如: 25.00"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lon">经度</Label>
              <Input
                id="lon"
                type="number"
                step="0.01"
                placeholder="例如: 120.00"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">开始日期</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">结束日期</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleQuery} disabled={loading} className="w-full">
            {loading ? '查询中...' : '查询'}
          </Button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
      </Card>

      {data.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>查询结果</CardTitle>
              <CardDescription>
                找到 {data.length} 条记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <Badge variant="secondary">
                  纬度: {data[0].lat}°
                </Badge>
                <Badge variant="secondary">
                  经度: {data[0].lon}°
                </Badge>
              </div>

              <ScrollArea className="h-64 w-full">
                <div className="space-y-2">
                  {data.slice(0, 20).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm p-2 border-b">
                      <span>{item.date}</span>
                      <span className="font-semibold">{item.sst.toFixed(2)}°C</span>
                    </div>
                  ))}
                  {data.length > 20 && (
                    <p className="text-center text-gray-500 text-sm mt-2">
                      还有 {data.length - 20} 条记录...
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>温度趋势图</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={Math.floor(chartData.length / 10)}
                  />
                  <YAxis label={{ value: '温度 (°C)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}