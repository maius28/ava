<template>
  <div class="amap-container">
    <!-- 地图控制面板 -->
    <!-- <div class="map-controls">
      <h3>监控面板</h3>
      <div class="control-buttons">
        <button @click="openList" class="btn btn-info">详情列表</button>
        <button @click="resetView" class="btn btn-primary">重置视图</button>
        <button @click="toggleSatellite" class="btn btn-secondary">
          {{ mapStyle === 'normal' ? '默认主题' : '黑夜模式' }}
        </button>
      </div>
    </div> -->

    <!-- 地图容器 -->
    <div
      ref="mapContainer"
      id="amap-container"
      class="map-wrapper"
    ></div>

    <!-- 地图信息面板 -->
    <div v-if="mapInfo.visible" class="map-info-panel">
      <div class="info-header">
        <h4>{{ mapInfo.title }}</h4>
        <button @click="mapInfo.visible = false" class="close-btn">&times;</button>
      </div>
      <div class="info-content">
        <p><strong>经度:</strong> {{ mapInfo.lng }}</p>
        <p><strong>纬度:</strong> {{ mapInfo.lat }}</p>
        <p><strong>缩放级别:</strong> {{ mapInfo.zoom }}</p>
        <p><strong>地址:</strong> {{ mapInfo.address }}</p>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>地图加载中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import type {
  AMapMap,
  AMapStatic
} from '@/types/amap'

// 高德地图配置 - 支持环境变量
const AMAP_CONFIG = {
  key: import.meta.env.VITE_AMAP_KEY || 'a7246ce1dbb1a3f8e9488bb6e9d2d02d', // 优先使用环境变量
  version: '2.0',
  plugins: [
    'AMap.Scale',
    'AMap.ToolBar',
    'AMap.HawkEye',
    'AMap.Geocoder'
  ],
  securityJsCode: import.meta.env.VITE_AMAP_SECURITY_JS_CODE || '855bfc21bb81ada2603038fff5f5d93d' // 优先使用环境变量
}

// 组件状态
const mapContainer = ref<HTMLElement>()
const map = ref<AMapMap | null>(null)
const loading = ref(true)
const mapStyle = ref<'normal' | 'dark'>('normal')
const AMap = ref<AMapStatic | null>(null)

// 地图信息
const mapInfo = ref({
  visible: false,
  title: '位置信息',
  lng: '',
  lat: '',
  zoom: '',
  address: ''
})

/**
 * 初始化地图
 */
const initMap = async (): Promise<void> => {
  try {
    loading.value = true

    // 设置安全密钥（如果有的话）
    if (AMAP_CONFIG.securityJsCode !== '你的安全密钥') {
      window._AMapSecurityConfig = {
        securityJsCode: AMAP_CONFIG.securityJsCode,
      }
    }

    // 使用 AMapLoader 加载高德地图
    AMap.value = await AMapLoader.load({
      key: AMAP_CONFIG.key,
      version: AMAP_CONFIG.version,
      plugins: AMAP_CONFIG.plugins,
    })

    console.log('高德地图API加载成功')

    await nextTick()

    if (!mapContainer.value) {
      throw new Error('地图容器未找到')
    }

    // 创建地图实例
    if (!AMap.value) {
      throw new Error('高德地图API加载失败')
    }

    map.value = new AMap.value.Map(mapContainer.value, {
      center: [104.066, 30.572], // 中国地理中心
      zoom: 5,
      viewMode: '2D',
      lang: 'zh_cn',
      mapStyle: 'amap://styles/dark',
      features: ['bg', 'road', 'building', 'point'],
      resizeEnable: true,
      rotateEnable: false,
      dragEnable: true,
      zoomEnable: true,
      doubleClickZoom: true,
      keyboardEnable: true,
      scrollWheel: true,
      expandZoomRange: true,
      zooms: [3, 18]
    })

    // 地图加载完成事件
    map.value.on('complete', () => {
      console.log('地图加载完成')
      loading.value = false

      // 添加地图控件
      addMapControls()

    })

  } catch (error) {
    console.error('地图初始化失败:', error)
    loading.value = false
  }
}/**
 * 添加地图控件
 */
const addMapControls = (): void => {
  if (!map.value || !AMap.value) return

  try {
    // 添加缩放工具条
    const toolbar = new AMap.value.ToolBar({
      position: 'RT' // 右上角
    })
    map.value.addControl(toolbar)

    // 添加比例尺
    const scale = new AMap.value.Scale({
      position: 'LB' // 左下角
    })
    map.value.addControl(scale)

    // 添加鹰眼控件
    const hawkEye = new AMap.value.HawkEye({
      isOpen: false,
      visible: true
    })
    map.value.addControl(hawkEye)

    console.log('地图控件添加完成')
  } catch (error) {
    console.error('添加地图控件失败:', error)
  }
}

/**
 * 重置地图视图
 */
const resetView = (): void => {
  if (!map.value) return

  map.value.setZoomAndCenter(5, [104.066, 30.572])
  mapInfo.value.visible = false
  console.log('地图视图已重置')
}

/**
 * 切换地图样式
 */
const toggleSatellite = (): void => {
  if (!map.value) return

  if (mapStyle.value === 'normal') {
    map.value.setMapStyle('amap://styles/dark')
    mapStyle.value = 'dark'
    console.log('切换到黑夜模式')
  } else {
    map.value.setMapStyle('amap://styles/normal')
    mapStyle.value = 'normal'
    console.log('切换到普通地图')
  }
}


// 生命周期钩子
onMounted(async () => {
  try {
    await initMap()
  } catch (error) {
    console.error('组件初始化失败:', error)
    loading.value = false
  }
})

onUnmounted(() => {
  // 清理地图实例
  if (map.value) {
    map.value.destroy()
    console.log('地图实例已销毁')
  }
})
</script>

<style scoped>
.amap-container {
  position: relative;
  width: 100%;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.map-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-controls h3 {
  margin: 0;
  color: #1890ff;
  font-size: 20px;
  font-weight: 600;
}

.control-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #40a9ff;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #d9d9d9;
}

.btn-info {
  background: #52c41a;
  color: white;
}

.btn-info:hover {
  background: #73d13d;
}

.map-wrapper {
  width: 100%;
  height: 100vh;
  padding-top: 80px;
  box-sizing: border-box;
}

#amap-container {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.map-info-panel {
  position: absolute;
  top: 100px;
  right: 20px;
  width: 300px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
}

.info-header {
  background: #1890ff;
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-header h4 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.info-content {
  padding: 16px;
}

.info-content p {
  margin: 8px 0;
  color: #333;
  line-height: 1.5;
}

.info-content strong {
  color: #1890ff;
  margin-right: 8px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loading-content {
  text-align: center;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .map-controls {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }

  .map-controls h3 {
    font-size: 18px;
  }

  .control-buttons {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .map-wrapper {
    padding-top: 100px;
  }

  .map-info-panel {
    width: calc(100% - 40px);
    right: 20px;
    left: 20px;
  }
}

/* 地图控件样式优化 */
:deep(.amap-toolbar) {
  background: rgba(255, 255, 255, 0.9) !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1) !important;
}

:deep(.amap-scale) {
  background: rgba(255, 255, 255, 0.9) !important;
  border-radius: 6px !important;
  padding: 6px 12px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

:deep(.amap-hawkeye) {
  border-radius: 8px !important;
  overflow: hidden !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1) !important;
}
</style>
