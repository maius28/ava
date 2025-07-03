// src/api/auth.ts
import { post } from './request'

// 登录请求参数接口
export interface LoginParams {
  username: string
  password: string
}

// 登录响应接口
export interface LoginResponse {
  code: number
  message: string
  data?: {
    token: string
    user: {
      id: number
      username: string
      [key: string]: any // 其他可能的用户信息字段
    }
  }
}

/**
 * 用户登录API
 * @param params 登录参数
 * @returns Promise<LoginResponse>
 */
export function login(params: LoginParams): Promise<LoginResponse> {
  return post<LoginResponse>('/api/login', params)
}

/**
 * 用户登出API
 * @returns Promise<any>
 */
export function logout(): Promise<any> {
  return post<any>('/logout')
}

/**
 * 获取当前用户信息
 * @returns Promise<any>
 */
export function getUserInfo(): Promise<any> {
  return post<any>('/user/info')
}
