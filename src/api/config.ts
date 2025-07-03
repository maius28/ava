// src/api/config.ts
export interface ApiConfig {
  baseURL: string
  timeout: number
  headers: Record<string, string>
}

// 默认配置
const defaultConfig: ApiConfig = {
  baseURL: 'http://localhost:8080',
  timeout: 10000, // 10秒
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
}

// 开发环境配置
const devConfig: ApiConfig = {
  ...defaultConfig,
}

// 生产环境配置
const prodConfig: ApiConfig = {
  ...defaultConfig,
  // 使用 import.meta.env 代替 process.env
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://api.example.com',
}

// 使用 import.meta.env.PROD 检查是否是生产环境
const config = import.meta.env.PROD ? prodConfig : devConfig

export default config
