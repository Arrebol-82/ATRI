export type HomeNavItem = {
  label: string
  text: string
  to: string
}

export const homeNavItems: HomeNavItem[] = [
  { label: 'HOME', text: 'Blue Memories', to: '/' },
  { label: 'STORY', text: 'Story Gallery', to: '/#story' },
  { label: 'CHARACTER', text: 'Characters', to: '/#characters' },
  { label: 'LOCATION', text: 'Scene Gallery', to: '/#scenes' },
  { label: 'NEWS', text: 'News', to: '/#news' },
  { label: 'GOODS', text: 'Merchandise', to: '/merchandise' }
]
