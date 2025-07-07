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

// 登出响应接口
export interface LogoutResponse {
  code: number
  message: string
}

/**
 * 用户登录API
 * @param params 登录参数
 * @returns Promise<LoginResponse>
 */
export function login(params: LoginParams): Promise<LoginResponse> {
  // Mock登录逻辑
  return new Promise((resolve) => {
    setTimeout(() => {
      if (params.username === 'admin') {
        resolve({
          code: 200,
          message: 'Success',
          data: {
            token:
              'eyJhbGciOiJIUzM4NCJ9.eyJyb2xlSWQiOjEsInVzZXJJZCI6MSwic3ViIjoiYWRtaW4iLCJpYXQiOjE3NTE2MDY0ODUsImV4cCI6MTc1MTY5Mjg4NX0.6gcri_euztcp6BRFRX8lLbBVfyOZnuL2EYV9Eriy8XKDZZluiRBxkrPHkTTfW9od',
            userId: 1,
            username: 'admin',
            roleId: 1,
            permissionUrls: ['/dashboard', '/userTag', '/mapView'],
          },
        })
      } else if (params.username === 'agent') {
        resolve({
          code: 200,
          message: 'Success',
          data: {
            token:
              'eyJhbGciOiJIUzM4NCJ9.eyJyb2xlSWQiOjEsInVzZXJJZCI6MSwic3ViIjoiYWRtaW4iLCJpYXQiOjE3NTE2MDY0ODUsImV4cCI6MTc1MTY5Mjg4NX0.6gcri_euztcp6BRFRX8lLbBVfyOZnuL2EYV9Eriy8XKDZZluiRBxkrPHkTTfW9od',
            userId: 2,
            username: 'agent',
            roleId: 2,
            permissionUrls: ['/intel'],
          },
        })
      } else {
        resolve({
          code: 401,
          message: '用户名或密码错误',
        })
      }
    }, 500) // 模拟网络延迟
  })
}

/**
 * 用户登出API
 * @returns Promise<LogoutResponse>
 */
export function logout(): Promise<LogoutResponse> {
  return post<LogoutResponse>('/logout')
}
