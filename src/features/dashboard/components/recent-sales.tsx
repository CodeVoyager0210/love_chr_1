import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Thermometer, Image, MapPin, MessageSquare } from 'lucide-react'

export function RecentSales() {
  return (
    <div className='space-y-8'>
      <div className='flex items-center gap-4 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors'>
        <Avatar className='h-9 w-9 bg-blue-100'>
          <AvatarFallback className='text-blue-600'>
            <Thermometer className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>海面温度系统</p>
            <p className='text-muted-foreground text-sm'>
              查看全球海洋温度数据
            </p>
          </div>
          <Badge variant="secondary">主要功能</Badge>
        </div>
      </div>

      <div className='flex items-center gap-4 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors'>
        <Avatar className='h-9 w-9 bg-green-100'>
          <AvatarFallback className='text-green-600'>
            <Image className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>温度分布图</p>
            <p className='text-muted-foreground text-sm'>
              可视化温度分布
            </p>
          </div>
          <Badge variant="outline">每日更新</Badge>
        </div>
      </div>

      <div className='flex items-center gap-4 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors'>
        <Avatar className='h-9 w-9 bg-purple-100'>
          <AvatarFallback className='text-purple-600'>
            <MapPin className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>区域分析</p>
            <p className='text-muted-foreground text-sm'>
              特定海域深度分析
            </p>
          </div>
          <Badge variant="outline">高精度</Badge>
        </div>
      </div>

      <div className='flex items-center gap-4 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors'>
        <Avatar className='h-9 w-9 bg-orange-100'>
          <AvatarFallback className='text-orange-600'>
            <MessageSquare className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>用户反馈</p>
            <p className='text-muted-foreground text-sm'>
              提交建议和意见
            </p>
          </div>
          <Badge variant="outline">20+ 条</Badge>
        </div>
      </div>

      <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
        <p className='text-sm font-medium text-blue-900 mb-2'>快速提示</p>
        <p className='text-xs text-blue-700'>
          点击上方任一功能卡片可快速访问对应功能模块
        </p>
      </div>
    </div>
  )
}