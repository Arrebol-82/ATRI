export type HomeNavItem = {
  label: string
  text: string
  to: string
}

export const homeNavItems: HomeNavItem[] = [
  { label: '首页', text: '', to: '/' },
  { label: 'STORY', text: 'Story Gallery', to: '/#story' },
  { label: 'CHARACTER', text: 'Characters', to: '/#characters' },
  { label: 'LOCATION', text: 'Scene Gallery', to: '/#scenes' },
  { label: 'NEWS', text: 'News', to: '/#news' },
  { label: 'THANKS', text: 'Thanks Watching', to: '/#thanks-watching' },
  { label: '周边商品', text: '官方周边', to: '/merchandise' }
]
