// src/api/request.ts
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import apiConfig from './config'

// 创建axios实例
const instance: AxiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: apiConfig.headers,
  withCredentials: true,
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    return response.data
  },
  (error) => {
    let message = '请求失败'

    if (error.response) {
      // 服务器返回错误状态码
      const status = error.response.status

      switch (status) {
        case 400:
          message = '请求错误'
          break
        case 401:
          message = '未授权，请重新登录'
          // 可以在这里处理未授权的情况，例如重定向到登录页
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址错误'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = `未知错误(${status})`
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      message = '服务器未响应'
    }

    console.error('API请求错误:', message, error)

    return Promise.reject(error)
  },
)

// 封装GET请求
export function get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return instance.get(url, { params, ...config })
}

// 封装POST请求
export function post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return instance.post(url, data, config)
}

// 封装PUT请求
export function put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return instance.put(url, data, config)
}

// 封装DELETE请求
export function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return instance.delete(url, config)
}

export default instance
