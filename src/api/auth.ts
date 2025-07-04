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
    userId: number
    username: string
    permissionUrls: string[]
    roleId: number
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
