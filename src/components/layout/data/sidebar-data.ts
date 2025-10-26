import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Thermometer,
  MapPin,
  Image,
  MessageSquare,
} from 'lucide-react'
import { ClerkLogo } from '@/assets/clerk-logo'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'hujieming',
    email: 'hujieming0825@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: '海洋表面温度查询系统',
      logo: Command,
      plan: 'SST Analysis Tool',
    },
  ],
  navGroups: [
    {
      title: '海洋温度分析',
      items: [
        {
          title: '海面温度系统',
          url: '/sst',
          icon: Thermometer,
        },
        {
          title: '海面温度分布图',
          url: '/sst-query',
          icon: Image,
        },
        {
          title: '区域海面温度分析',
          url: '/regional-analysis',
          icon: MapPin,
        },
        {
          title: '用户需求建议',
          url: '/feedback',
          icon: MessageSquare,
        },
      ],
    },
    {
      title: '其他',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
      ],
    },
  ],
}
