import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
  nickname: string
  avatar: string // data URL or emoji
  bio: string
  createdAt: string
}

interface UserState {
  profile: UserProfile | null
  isLoggedIn: boolean

  /** 设置用户信息（简易本地注册） */
  setProfile: (profile: Partial<UserProfile>) => void
  /** 登出 */
  logout: () => void
  /** 获取昵称（未登录返回空字符串） */
  getNickname: () => string
}

const defaultAvatars = ['🌟', '🚀', '🎨', '📚', '🌙', '✨', '🎵', '🌈', '🔥', '💎']

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoggedIn: false,

      setProfile: (partial) => {
        const existing = get().profile
        const profile: UserProfile = {
          nickname: partial.nickname || existing?.nickname || '梦想家',
          avatar: partial.avatar || existing?.avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)],
          bio: partial.bio || existing?.bio || '',
          createdAt: existing?.createdAt || new Date().toISOString(),
        }
        set({ profile, isLoggedIn: true })
      },

      logout: () => set({ profile: null, isLoggedIn: false }),

      getNickname: () => get().profile?.nickname || '',
    }),
    { name: 'mydreambook-user' }
  )
)
