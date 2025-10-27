import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { sstApi, SSTData } from '@/services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function SSTDataQuery() {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SSTData[]>([]);
  const [error, setError] = useState('');
  const [queryStats, setQueryStats] = useState<any>(null);

  // 验证经纬度是否符合数据库格式
  const validateCoordinate = (value: string, type: 'lat' | 'lon'): boolean => {
    const num = parseFloat(value);
    if (isNaN(num)) return false;

    if (type === 'lat') {
      // 纬度范围: -78.375 到 89.875，以0.25递增
      if (num < -78.375 || num > 89.875) return false;
    } else {
      // 经度范围: 0.125 到 359.875，以0.25递增
      if (num < 0.125 || num > 359.875) return false;
    }

    // 检查是否符合0.25递增的格式（从0.125开始）
    const multiplied = num / 0.25;
    const fractionalPart = multiplied - Math.floor(multiplied);
    // 有效的值应该是x.5的形式，即小数部分是0.5
    return Math.abs(fractionalPart - 0.5) < 0.001;
  };

  const handleQuery = async () => {
    // 输入验证
    if (!lat || !lon) {
      setError('请输入经纬度');
      return;
    }

    if (!validateCoordinate(lat, 'lat')) {
      setError('纬度必须是0.25递增的值，范围-78.375到89.875（如：25.375, 89.875, -45.625）');
      return;
    }

    if (!validateCoordinate(lon, 'lon')) {
      setError('经度必须是0.25递增的值，范围0.125到359.875（如：168.125, 359.875, 0.375）');
      return;
    }

    setLoading(true);
    setError('');
    setQueryStats(null);

    try {
      const params: any = {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        limit: 2000
      };

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const result = await sstApi.getSSTDataExact(params);

      if (result.success && result.data.length > 0) {
        setData(result.data);
        setQueryStats({
          queryTime: result.queryTime,
          queryTimeMs: result.performance.queryTimeMs,
          indexUsed: result.performance.indexUsed,
          count: result.count,
          parameters: result.parameters
        });
      } else {
        setError('未找到数据，请检查输入的经纬度和日期范围');
        setData([]);
      }
    } catch (err: any) {
      console.error('查询错误:', err);
      if (err.response?.data?.error === '参数错误') {
        setError(err.response.data.message);
      } else {
        setError('查询失败：' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    if (data.length === 0) {
      setError('没有数据可下载');
      return;
    }

    try {
      const params: any = {
        lat: parseFloat(lat),
        lon: parseFloat(lon)
      };

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const blob = await sstApi.downloadSSTDataCSV(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sst_data_${lat}_${lon}_${startDate || 'start'}_${endDate || 'end'}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('下载失败，请稍后重试');
    }
  };

  const chartData = data.map(item => {
    try {
      return {
        date: new Date(item.date).toLocaleDateString('zh-CN'),
        temperature: parseFloat(item.sst) || 0,
        anomaly: item.anom ? parseFloat(item.anom) : undefined
      };
    } catch (error) {
      console.error('日期解析错误:', item.date, error);
      return {
        date: item.date || '未知日期',
        temperature: parseFloat(item.sst) || 0,
        anomaly: item.anom ? parseFloat(item.anom) : undefined
      };
    }
  }).reverse();

  return (
    <div className="space-y-6">
      {/* 查询表单 */}
      <Card>
        <CardHeader>
          <CardTitle>海洋表面温度查询</CardTitle>
          <CardDescription>
            查询特定经纬度的历史温度数据（支持精确坐标查询）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 输入提示 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>经纬度格式要求：</strong>必须是0.25递增的值
            </p>
            <p className="text-sm text-blue-600 mt-1">
              纬度范围：-78.375 到 89.875（如：25.375, 89.875, -45.625）
            </p>
            <p className="text-sm text-blue-600">
              经度范围：0.125 到 359.875（如：168.125, 359.875, 0.375）
            </p>
          </div>

          {/* 经纬度输入 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="lat">纬度 *</Label>
              <Input
                id="lat"
                type="number"
                step="0.25"
                placeholder="例如: 25.375"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className={lat && !validateCoordinate(lat, 'lat') ? 'border-red-500' : ''}
              />
              {lat && !validateCoordinate(lat, 'lat') && (
                <p className="text-red-500 text-xs">纬度格式不正确</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lon">经度 *</Label>
              <Input
                id="lon"
                type="number"
                step="0.25"
                placeholder="例如: 168.125"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                className={lon && !validateCoordinate(lon, 'lon') ? 'border-red-500' : ''}
              />
              {lon && !validateCoordinate(lon, 'lon') && (
                <p className="text-red-500 text-xs">经度格式不正确</p>
              )}
            </div>
          </div>

          {/* 日期输入 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">开始日期</Label>
              <Input
                id="startDate"
                type="date"
                min="2025-01-01"
                max="2025-07-31"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">结束日期</Label>
              <Input
                id="endDate"
                type="date"
                min="2025-01-01"
                max="2025-07-31"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* 查询按钮 */}
          <div className="flex gap-4">
            <Button
              onClick={handleQuery}
              disabled={loading || !lat || !lon || !validateCoordinate(lat, 'lat') || !validateCoordinate(lon, 'lon')}
              className="flex-1"
            >
              {loading ? '查询中...' : '查询SST数据'}
            </Button>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</p>}
        </CardContent>
      </Card>

      {/* 查询结果 */}
      {data.length > 0 && (
        <>
          {/* 查询统计 */}
          {queryStats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">查询统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">查询时间</p>
                    <p className="text-xl font-bold text-green-600">{queryStats.queryTimeMs}ms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">数据条数</p>
                    <p className="text-xl font-bold">{queryStats.count}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">使用索引</p>
                    <p className="text-sm font-mono text-blue-600">{queryStats.indexUsed}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">查询坐标</p>
                    <p className="text-sm">{queryStats.parameters.latitude}, {queryStats.parameters.longitude}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 数据表格和下载 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>查询结果</CardTitle>
                  <CardDescription>
                    找到 {data.length} 条温度数据记录
                  </CardDescription>
                </div>
                <Button onClick={handleDownloadCSV} variant="outline">
                  📥 下载CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <Badge variant="secondary">
                  纬度: {data[0].latitude}°
                </Badge>
                <Badge variant="secondary">
                  经度: {data[0].longitude}°
                </Badge>
                {startDate && <Badge variant="outline">从: {startDate}</Badge>}
                {endDate && <Badge variant="outline">到: {endDate}</Badge>}
              </div>

              <ScrollArea className="h-64 w-full border rounded-lg">
                <div className="p-2">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="p-2 text-left">日期</th>
                        <th className="p-2 text-right">温度 (°C)</th>
                        <th className="p-2 text-right">异常值 (°C)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(0, 50).map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            {(() => {
                              try {
                                return new Date(item.date).toLocaleDateString('zh-CN');
                              } catch {
                                return item.date || '未知日期';
                              }
                            })()}
                          </td>
                          <td className="p-2 text-right font-semibold">
                            {(() => {
                              try {
                                const temp = parseFloat(item.sst);
                                return isNaN(temp) ? '-' : temp.toFixed(2);
                              } catch {
                                return item.sst || '-';
                              }
                            })()}
                          </td>
                          <td className="p-2 text-right">
                            {(() => {
                              try {
                                const anom = parseFloat(item.anom);
                                return isNaN(anom) ? '-' : anom.toFixed(2);
                              } catch {
                                return item.anom || '-';
                              }
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.length > 50 && (
                    <p className="text-center text-gray-500 text-sm mt-2 p-2">
                      还有 {data.length - 50} 条记录（请使用CSV下载获取完整数据）
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* 温度趋势图 */}
          <Card>
            <CardHeader>
              <CardTitle>温度趋势图</CardTitle>
              <CardDescription>
                显示指定位置的海表温度随时间变化趋势
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={Math.ceil(chartData.length / 12)}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{ value: '温度 (°C)', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}
                    formatter={(value: any, name: string) => {
                      try {
                        const numValue = parseFloat(value);
                        return [
                          isNaN(numValue) ? `${value}°C` : `${numValue.toFixed(2)}°C`,
                          name === 'temperature' ? '海表温度' : '温度异常'
                        ];
                      } catch {
                        return [`${value}°C`, name === 'temperature' ? '海表温度' : '温度异常'];
                      }
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#2563eb' }}
                    activeDot={{ r: 5 }}
                    name="海表温度"
                  />
                  {chartData.some(d => d.anomaly !== undefined) && (
                    <Line
                      type="monotone"
                      dataKey="anomaly"
                      stroke="#dc2626"
                      strokeWidth={1}
                      dot={false}
                      strokeDasharray="5 5"
                      name="温度异常"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}