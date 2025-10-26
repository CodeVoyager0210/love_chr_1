import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/sst-query/')({
  component: SSTQueryPage,
})

function SSTQueryPage() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [latitude, setLatitude] = useState<string>('')
  const [longitude, setLongitude] = useState<string>('')
  const [sstData, setSstData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])

  const handleDateQuery = async () => {
    if (!selectedDate) {
      alert('请选择日期')
      return
    }

    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模拟返回的SST数据
      setSstData({
        date: format(selectedDate, 'yyyy-MM-dd'),
        temperature: 25.5,
        latitude: 30.5,
        longitude: 120.5
      })
    } catch (error) {
      console.error('查询失败:', error)
      alert('查询失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleLocationQuery = async () => {
    if (!latitude || !longitude) {
      alert('请输入经纬度')
      return
    }

    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模拟返回的位置查询数据
      setSstData({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        temperature: 24.8,
        date: format(new Date(), 'yyyy-MM-dd')
      })
    } catch (error) {
      console.error('查询失败:', error)
      alert('查询失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const downloadPNG = () => {
    alert('PNG下载功能将在后续实现')
  }

  const downloadNetCDF = () => {
    alert('NetCDF下载功能将在后续实现')
  }

  const queryTimeSeries = async () => {
    if (!sstData) {
      alert('请先查询温度数据')
      return
    }

    setLoading(true)
    try {
      // 模拟API调用获取时间序列数据
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模拟时间序列数据
      const mockTimeSeriesData = Array.from({ length: 30 }, (_, i) => ({
        date: format(new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        sst: 24 + Math.random() * 3,
        iceConcentration: Math.max(0, Math.random() * 0.8)
      }))

      setChartData(mockTimeSeriesData)
    } catch (error) {
      console.error('查询失败:', error)
      alert('查询失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">海面温度查询</h1>
        <p className="text-muted-foreground">查询指定日期的海洋表面温度数据</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 日期查询卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>日期查询</CardTitle>
            <CardDescription>选择日期查询当日的海面温度分布</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">选择日期</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className={cn("rounded-md border")}
              />
            </div>
            <Button
              onClick={handleDateQuery}
              disabled={loading || !selectedDate}
              className="w-full"
            >
              {loading ? '查询中...' : '查询'}
            </Button>
          </CardContent>
        </Card>

        {/* 位置查询卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>经纬度查询</CardTitle>
            <CardDescription>输入经纬度查询具体位置的海面温度</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">纬度</Label>
              <Input
                id="latitude"
                placeholder="例如: 30.5"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">经度</Label>
              <Input
                id="longitude"
                placeholder="例如: 120.5"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
            <Button
              onClick={handleLocationQuery}
              disabled={loading || !latitude || !longitude}
              className="w-full"
            >
              {loading ? '查询中...' : '查询'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 结果显示区域 */}
      {sstData && (
        <Card>
          <CardHeader>
            <CardTitle>查询结果</CardTitle>
            <CardDescription>海面温度查询结果</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-1">
                <Label className="text-sm font-medium">日期</Label>
                <p className="text-lg font-semibold">{sstData.date}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">温度</Label>
                <p className="text-lg font-semibold">{sstData.temperature}°C</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">纬度</Label>
                <p className="text-lg font-semibold">{sstData.latitude}°</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">经度</Label>
                <p className="text-lg font-semibold">{sstData.longitude}°</p>
              </div>
            </div>

            {/* 温度图表占位符 */}
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center mb-4">
              <p className="text-muted-foreground">温度分布图表</p>
            </div>

            {/* 下载按钮 */}
            <div className="flex gap-4">
              <Button onClick={downloadPNG} variant="outline">
                下载 PNG
              </Button>
              <Button onClick={downloadNetCDF} variant="outline">
                下载 NetCDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 时间序列查询 */}
      {sstData && (
        <Card>
          <CardHeader>
            <CardTitle>温度变化趋势</CardTitle>
            <CardDescription>查询指定位置的温度和海冰浓度变化趋势</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={queryTimeSeries}
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? '查询中...' : '查询温度变化趋势'}
              </Button>

              {chartData.length > 0 && (
                <div className="h-80 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">温度和海冰浓度变化图表</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}