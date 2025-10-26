import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnalyticsChart } from './analytics-chart'
import { Thermometer, TrendingUp, Waves, Globe, Calendar, Database } from 'lucide-react'

export function Analytics() {
  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waves className="w-5 h-5" />
            海洋温度数据分析
          </CardTitle>
          <CardDescription>
            2025年全球海洋表面温度监测与统计分析
          </CardDescription>
        </CardHeader>
        <CardContent className='px-6'>
          <AnalyticsChart />
        </CardContent>
      </Card>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>平均温度</CardTitle>
            <Thermometer className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>21.3°C</div>
            <p className='text-muted-foreground text-xs'>全球海面平均温度</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              温度范围
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>-2°C ~ 35°C</div>
            <p className='text-muted-foreground text-xs'>实测温度范围</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>数据分辨率</CardTitle>
            <Globe className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0.25°</div>
            <p className='text-muted-foreground text-xs'>经纬度网格精度</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>更新频率</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>每日</div>
            <p className='text-muted-foreground text-xs'>数据更新频率</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              数据质量统计
            </CardTitle>
            <CardDescription>
              NOAA OISST数据集质量指标
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">有效数据覆盖率</span>
                <Badge variant="secondary">98.5%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">缺失数据率</span>
                <Badge variant="outline">1.5%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">平均误差范围</span>
                <span className="text-sm font-medium">±0.3°C</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">数据延迟</span>
                <span className="text-sm font-medium">24小时</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='col-span-1 lg:col-span-3'>
          <CardHeader>
            <CardTitle>主要数据源</CardTitle>
            <CardDescription>
              NOAA数据采集来源分布
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">卫星观测</span>
                <Badge>85%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">浮标数据</span>
                <Badge variant="secondary">10%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">船舶观测</span>
                <Badge variant="outline">5%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>系统特点</CardTitle>
          <CardDescription>
            海洋表面温度查询系统的核心优势
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">全球覆盖</span>
              </div>
              <p className="text-xs text-muted-foreground ml-4">
                覆盖全球78.375°N-78.375°S海域
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">实时更新</span>
              </div>
              <p className="text-xs text-muted-foreground ml-4">
                每日更新最新温度数据
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium">高精度</span>
              </div>
              <p className="text-xs text-muted-foreground ml-4">
                0.25°网格分辨率数据
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">长期稳定</span>
              </div>
              <p className="text-xs text-muted-foreground ml-4">
                超过30年的连续观测记录
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}