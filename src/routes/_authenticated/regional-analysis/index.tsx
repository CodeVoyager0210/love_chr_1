import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/regional-analysis/')({
  component: RegionalAnalysisPage,
})

function RegionalAnalysisPage() {
  const [topLeftLat, setTopLeftLat] = useState<string>('')
  const [topLeftLng, setTopLeftLng] = useState<string>('')
  const [bottomRightLat, setBottomRightLat] = useState<string>('')
  const [bottomRightLng, setBottomRightLng] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>(null)

  const handleAnalyzeRegion = async () => {
    if (!topLeftLat || !topLeftLng || !bottomRightLat || !bottomRightLng) {
      alert('请完整填写区域坐标')
      return
    }

    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 模拟返回的区域分析数据
      setAnalysisData({
        region: {
          topLeft: { lat: parseFloat(topLeftLat), lng: parseFloat(topLeftLng) },
          bottomRight: { lat: parseFloat(bottomRightLat), lng: parseFloat(bottomRightLng) }
        },
        averageSST: 24.8,
        maxSST: 28.5,
        minSST: 21.2,
        iceConcentration: 0.15,
        analysisDate: new Date().toISOString().split('T')[0],
        dataPoints: 1250
      })
    } catch (error) {
      console.error('分析失败:', error)
      alert('分析失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const uploadToSstImages = () => {
    if (!analysisData) {
      alert('请先完成区域分析')
      return
    }
    alert('数据上传功能将在后续实现')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">区域海面温度分析</h1>
        <p className="text-muted-foreground">分析指定区域的海洋表面温度分布和特征</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 区域选择卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>区域选择</CardTitle>
            <CardDescription>输入分析区域的左上角和右下角坐标</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="topLeftLat">左上角纬度</Label>
                <Input
                  id="topLeftLat"
                  placeholder="例如: 35.0"
                  value={topLeftLat}
                  onChange={(e) => setTopLeftLat(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topLeftLng">左上角经度</Label>
                <Input
                  id="topLeftLng"
                  placeholder="例如: 120.0"
                  value={topLeftLng}
                  onChange={(e) => setTopLeftLng(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bottomRightLat">右下角纬度</Label>
                <Input
                  id="bottomRightLat"
                  placeholder="例如: 30.0"
                  value={bottomRightLat}
                  onChange={(e) => setBottomRightLat(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bottomRightLng">右下角经度</Label>
                <Input
                  id="bottomRightLng"
                  placeholder="例如: 125.0"
                  value={bottomRightLng}
                  onChange={(e) => setBottomRightLng(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleAnalyzeRegion}
              disabled={loading || !topLeftLat || !topLeftLng || !bottomRightLat || !bottomRightLng}
              className="w-full"
            >
              {loading ? '分析中...' : '开始分析'}
            </Button>
          </CardContent>
        </Card>

        {/* 分析结果卡片 */}
        {analysisData && (
          <Card>
            <CardHeader>
              <CardTitle>分析结果</CardTitle>
              <CardDescription>区域海面温度分析统计信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">平均海表温度</Label>
                  <p className="text-lg font-semibold">{analysisData.averageSST}°C</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">最高温度</Label>
                  <p className="text-lg font-semibold text-red-600">{analysisData.maxSST}°C</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">最低温度</Label>
                  <p className="text-lg font-semibold text-blue-600">{analysisData.minSST}°C</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">海冰浓度</Label>
                  <p className="text-lg font-semibold">{(analysisData.iceConcentration * 100).toFixed(1)}%</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">数据点数</Label>
                  <p className="text-lg font-semibold">{analysisData.dataPoints}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">分析日期</Label>
                  <p className="text-lg font-semibold">{analysisData.analysisDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 区域温度分布图 */}
      {analysisData && (
        <Card>
          <CardHeader>
            <CardTitle>区域温度分布图</CardTitle>
            <CardDescription>分析区域的海面温度空间分布</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-muted rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">区域温度分布热力图</p>
                <p className="text-sm text-muted-foreground">
                  坐标范围: ({analysisData.region.topLeft.lat}, {analysisData.region.topLeft.lng})
                  到 ({analysisData.region.bottomRight.lat}, {analysisData.region.bottomRight.lng})
                </p>
              </div>
            </div>
            <Button onClick={uploadToSstImages}>
              上传到sst_images表
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 统计分析 */}
      {analysisData && (
        <Card>
          <CardHeader>
            <CardTitle>统计分析</CardTitle>
            <CardDescription>详细的区域温度统计分析</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-green-600">温度范围</Label>
                <div className="space-y-1">
                  <p className="text-sm">正常范围: 20-30°C</p>
                  <p className="text-sm">当前范围: {analysisData.minSST}°C - {analysisData.maxSST}°C</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-600">温度异常</Label>
                <div className="space-y-1">
                  <p className="text-sm">平均温度偏差: {((analysisData.averageSST - 25) / 25 * 100).toFixed(1)}%</p>
                  <p className="text-sm">温度标准差: 1.8°C</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-purple-600">海冰状况</Label>
                <div className="space-y-1">
                  <p className="text-sm">海冰覆盖率: {(analysisData.iceConcentration * 100).toFixed(1)}%</p>
                  <p className="text-sm">冰情等级: 轻微</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}