// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/Login'

export const useAuthStore = defineStore('auth', () => {
  // 状态 - 使用UserInfo类型
  const userInfo = ref<UserInfo | null>(null)

  // 计算属性
  const isLoggedIn = computed<boolean>(() => {
    return !!userInfo.value
  })

  // 方法
  const login = (user: UserInfo, remember: boolean = false) => {
    const storage = remember ? localStorage : sessionStorage
    storage.setItem('userInfo', JSON.stringify(user))
    userInfo.value = user
  }

  const logout = () => {
    localStorage.removeItem('userInfo')
    sessionStorage.removeItem('userInfo')
    localStorage.removeItem('token')
    userInfo.value = null
    // window.location.reload() // 强制刷新页面
  }

  // 初始化时从本地存储恢复用户信息
  const initUserInfo = () => {
    const data = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo')
    userInfo.value = data ? JSON.parse(data) : null
  }

  // 更新用户信息
  const updateUserInfo = (newUserInfo: Partial<UserInfo>) => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...newUserInfo }
      // 同时更新存储
      const storage = localStorage.getItem('userInfo')
        ? localStorage
        : sessionStorage.getItem('userInfo')
          ? sessionStorage
          : null
      if (storage) {
        storage.setItem('userInfo', JSON.stringify(userInfo.value))
      }
    }
  }

  return {
    userInfo,
    isLoggedIn,
    login,
    logout,
    updateUserInfo,
    initUserInfo,
  }
})
