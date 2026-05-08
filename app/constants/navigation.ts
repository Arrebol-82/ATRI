export type HomeNavItem = {
  label: string
  text: string
  to: string
}

export const homeNavItems: HomeNavItem[] = [
  { label: 'HOME', text: '首页', to: '/' },
  { label: 'STORY', text: '故事鉴赏', to: '/#story' },
  { label: 'CHARACTER', text: '人物鉴赏', to: '/#characters' },
  { label: 'LOCATION', text: '场景鉴赏', to: '/#scenes' },
  { label: 'NEWS', text: '新闻模块', to: '/#news' },
  { label: 'GOODS', text: '周边商品', to: '/merchandise' }
]
