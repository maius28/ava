<template>
  <div class="map-container-wrapper">
    <!-- 左上角用户信息 -->
    <div class="user-info-panel" v-if="props.algorithm != 'crossDomain'">
      <h3>用户信息</h3>
      <a-list class="user-list" :data-source="users" :bordered="false">
        <template #renderItem="{ item }">
          <a-list-item>
            <div class="user-item">
              <environment-outlined class="location-icon" />
              <span class="user-name">{{ item.name }}</span>
            </div>
            <!-- 添加标签列表 -->
            <div class="tag-container">
              <a-tag
                v-for="(tag, tagIndex) in item.tags"
                :key="tagIndex"
                :color="getTagColor(tagIndex)"
              >
                {{ tag }}
              </a-tag>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <div class="user-info-panel" v-if="props.algorithm === 'crossDomain'">
      <h3>目标选择</h3>
      <div ref="targetBarChart" class="target-bar-chart"></div>
    </div>

    <!-- 地图容器 -->
    <div ref="mapContainer" class="china-map-container"></div>

    <!-- 右上角信息列表 -->
    <div class="info-panel">
      <h3>情报信息</h3>
      <a-list class="info-list" :data-source="defaultInfoList" :bordered="false">
        <template #renderItem="{ item }">
          <a-list-item>
            <div class="info-item">
              <a-tag
                class="intel-dot"
                :style="{
                  backgroundColor: getColorById(item.id),
                  boxShadow: `0 0 10px ${getColorById(item.id)}`,
                }"
              ></a-tag>
              <span class="info-text">{{ item.text }}</span>
              <span class="info-time">{{ item.time }}</span>
            </div>
            <!-- 添加标签列表 -->
            <div class="tag-container">
              <a-tag
                v-for="(tag, tagIndex) in item.tags"
                :key="tagIndex"
                :color="getTagColor(tagIndex)"
              >
                {{ tag }}
              </a-tag>
            </div>
          </a-list-item>
        </template>
      </a-list>
      <a-button type="primary" class="algorithm-detail-btn" @click="goToDetail()" v-if="props.algorithm !== 'crossDomain'">
        算法详情</a-button
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { MapChart, EffectScatterChart, ScatterChart, LinesChart, BarChart } from 'echarts/charts'
// import { Map3DChart } from 'echarts-gl/charts';
import 'echarts-gl'
import {
  TitleComponent,
  TooltipComponent,
  GeoComponent,
  VisualMapComponent,
  LegendComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import ChinaJson from '@/assets/china.json'
import { EnvironmentOutlined } from '@ant-design/icons-vue'
import router from '@/router'

// 注册必要的ECharts组件
use([
  MapChart,
  EffectScatterChart,
  ScatterChart,
  LinesChart,
  TitleComponent,
  TooltipComponent,
  GeoComponent,
  VisualMapComponent,
  LegendComponent,
  BarChart,
])

// 定义传入的props,哪种算法
const props = defineProps({
  algorithm: {
    type: String,
    default: 'personalized',
  },
})

// 监听算法变化，更新地图显示
watch(
  () => props.algorithm,
  (newAlgorithm: string) => {
    if (chartInstance) {
      updateMapWithAlgorithm(newAlgorithm)
    }

    // Initialize target bar chart when algorithm is crossDomain
    if (newAlgorithm === 'crossDomain') {
      // Use nextTick to ensure DOM is updated
      nextTick(() => {
        initTargetBarChart()
      })
    }
  },
)

const goToDetail = () => {
  // 根据选个的算法跳转到不同的详情页面
  if (!props.algorithm) {
    console.warn('未选择算法，无法跳转到详情页面')
    return
  }
  switch (props.algorithm) {
    case 'personalized':
      //跳转到router.js的/extraction
      console.log('跳转到个性化推荐算法详情页面')
      router.push('/extraction')
      break
    case 'similarity':
      router.push({
        name: 'recommend',
        query: { algorithm: 'similarity' },
      })
      break
    case 'content-based':
      console.log('跳转到基于内容的算法详情页面')
      break
    default:
      console.warn(`未知算法: ${props.algorithm}`)
      return
  }
}

// 定义一组颜色数组
const colorPalette = [
  '#ff0000', // 红色
  '#ff9800', // 橙色
  '#2196f3', // 蓝色
  '#4caf50', // 绿色
  '#9c27b0', // 紫色
  '#ff5722', // 深橙色
  '#00bcd4', // 青色
  '#ffeb3b', // 黄色
  '#673ab7', // 深紫色
  '#3f51b5', // 靛蓝色
]

// // 根据索引获取颜色的方法
// const getColorByIndex = (index) => {
//   // 使用取模运算确保当索引超出颜色数组长度时能循环使用颜色
//   return colorPalette[index % colorPalette.length];
// };

// 根据ID获取颜色的方法
const getColorById = (id: number) => {
  return colorPalette[id % colorPalette.length]
}

// 获取标签颜色的方法
const getTagColor = (index: number) => {
  // 定义标签颜色数组
  const tagColors = [
    'blue',
    'cyan',
    'geekblue',
    'gold',
    'green',
    'lime',
    'magenta',
    'orange',
    'purple',
    'red',
    'volcano',
  ]
  return tagColors[index % tagColors.length]
}

// 用户位置数据
const users = ref([])

// 情报列表数据 - 包含坐标和相关用户
const defaultInfoList = ref([])

const mapContainer = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null
const updateInterval: number | null = null

// Add these to your existing refs
const targetBarChart = ref<HTMLElement | null>(null)
let targetChartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!mapContainer.value) return

  // 初始化ECharts实例
  chartInstance = echarts.init(mapContainer.value, 'dark')

  // 注册中国地图数据

  echarts.registerMap('China', ChinaJson)

  // 初始图表配置
  const option = {
    geo: {
      map: 'China',
      roam: false, // 禁用缩放和平移
      zoom: 1.2, // 初始缩放比例
      itemStyle: {
        areaColor: 'rgba(0,0,0,0)', // 地图区域颜色
        borderColor: 'rgba(0,0,0,0)', // 地图边界颜色
      },
      emphasis: {
        itemStyle: {
          areaColor: 'rgba(0,0,0,0)', // 鼠标悬停时的样式
          borderColor: 'rgba(0,0,0,0)', // 鼠标悬停时的样式
        },
      },
      silent: true, // 禁用鼠标事件
    },
    tooltip: {
      trigger: 'item', // 鼠标悬停时触发
      formatter: '{b}', // 显示省份名称
    },
    // label: {
    //   show: true,
    //   formatter: (name) => {
    //     return name.name ? name.name : '';
    //   },
    // },
    series: [
      // 3D地图
      {
        type: 'map3D',
        map: 'China',
        shading: 'lambert',
        realisticMaterial: {
          roughness: 0.2, // 粗糙度
          metalness: 10, // 金属度
        },
        light: {
          main: {
            color: '#1E63B0', // 主光源颜色
            intensity: 1.1, // 主光源强度
            shadow: true, // 是否开启阴影
          },
          ambient: {
            color: '#0a2463', // 环境光颜色
            intensity: 0.3, // 环境光强度
          },
        },
        viewControl: {
          distance: 80, // 视角距离
          alpha: 50, // 视角仰角
          beta: 10, // 视角角度
          autoRotate: false, // 禁用自动旋转
          rotateSensitivity: 0, // 禁用旋转
          zoomSensitivity: 0, // 禁用缩放
          panSensitivity: 0, // 禁用平移
        },
        label: {
          show: false,
          formatter: (params) => {
            return params.name ? params.name : ' '
          },
          textStyle: {
            color: '#fff',
            fontSize: 12,
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: [5, 5],
          },
          distance: 0,
          position: 'center',
        },
        itemStyle: {
          areaColor: '#1e3799', // 地图区域颜色
          borderColor: '#0FFFFF',
          borderWidth: 1,
          opacity: 0.8,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
          },
          itemStyle: {
            areaColor: '#4D9FFF',
          },
        },
      },
    ],
  }

  chartInstance?.setOption(option)

  // 处理窗口调整大小
  window.addEventListener('resize', handleResize)
}

// Add this function to initialize and update the target bar chart
const initTargetBarChart = () => {
  if (!targetBarChart.value) return

  // Initialize chart
  targetChartInstance = echarts.init(targetBarChart.value, 'dark')

  // Sample data for top 5 targets
  const targetData = [
    { name: 'F-16', value: 35 },
    { name: '罗斯福号', value: 28 },
    { name: 'F-22', value: 22 },
    { name: 'foo', value: 18 },
    { name: 'bee', value: 15 },
  ]

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: targetData.map((item) => item.name),
      axisLabel: {
        color: '#fff',
        rotate: 45,
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      name: '情报数量',
      nameTextStyle: {
        color: '#fff',
      },
      axisLabel: {
        color: '#fff',
      },
    },
    series: [
      {
        name: '情报数量',
        type: 'bar',
        data: targetData.map((item) => item.value),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#1E63B0' },
            { offset: 1, color: '#4D9FFF' },
          ]),
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#4D9FFF' },
              { offset: 1, color: '#83BFFF' },
            ]),
          },
        },
        barWidth: '40%',
      },
    ],
  }

  targetChartInstance.setOption(option)
}

const handleResize = () => {
  chartInstance?.resize()
  if (props.algorithm === 'crossDomain') {
    targetChartInstance?.resize()
  }
}

// 更新地图显示，不同的算法显示不同的推荐结果
const updateMapWithAlgorithm = (algorithm: string) => {
  console.log(`更新地图显示，使用算法: ${algorithm}`)
  // 如果是个性化算法
  switch (algorithm) {
    case 'personalized':
      updateMapPersonalized()
      break
    case 'similarity':
      // 这里可以添加协同过滤推荐算法逻辑
      console.log('使用协同过滤推荐算法')
      updateMapCollaborative()
      break
    case 'crossDomain':
      // 这里可以添加基于内容的推荐算法逻辑
      console.log('使用基于内容的推荐算法')
      updateMapCrossDomain()
      break
    default:
      console.warn(`未知算法: ${algorithm}`)
  }
}

const getLineColorByValue = (value) => {
  // 定义颜色范围：从浅红色到深红色
  const minColor = [255, 200, 200] // 浅红色 (RGB)
  const maxColor = [255, 0, 0] // 深红色 (RGB)

  // 将 value 映射到 0-1 的范围
  const normalizedValue = Math.min(Math.max(value / 100, 0), 1)

  // 计算颜色值
  const r = Math.floor(minColor[0] + (maxColor[0] - minColor[0]) * normalizedValue)
  const g = Math.floor(minColor[1] + (maxColor[1] - minColor[1]) * normalizedValue)
  const b = Math.floor(minColor[2] + (maxColor[2] - minColor[2]) * normalizedValue)

  return `rgb(${r},${g},${b})`
}

const updateMapCrossDomain = () => {
  if (!chartInstance) return

  // // 定义情报列表
  const infoList = [
    {
      id: 1,
      text: '南海地区发现不明舰船活动，建议加强监控。',
      time: '12:45',
      coords: [112, 10], // 南海坐标
      value: 80, // 假设关联度值
      tags: ['南海', '舰船', '监控'], // 标签
    },
    {
      id: 2,
      text: '东北地区电子干扰信号增强，可能影响通讯设备。',
      time: '11:30',
      coords: [120, 12], // 东北地区坐标
      value: 60, // 假设关联度值
      tags: ['东北', '电子干扰', '通讯'], // 标签
    },
    {
      id: 3,
      text: '西部边境例行巡逻发现异常足迹，已派遣人员调查。',
      time: '10:15',
      coords: [128, 14], // 西部边境坐标
      value: 40, // 假设关联度值
      tags: ['西部', '边境', '巡逻'], // 标签
    },
    {
      id: 4,
      text: '东海海域有不明飞行物出现，建议加强空中监控。',
      time: '09:00',
      coords: [132, 18], // 东海坐标
      value: 70, // 假设关联度值
      tags: ['东海', '飞行物', '监控'], // 标签
    }
  ]

  defaultInfoList.value = infoList

  // 获取当前所有选项
  const currentOption = chartInstance.getOption()
  const currentSeries = currentOption.series

  // 找到3D地图系列的索引
  let map3DIndex = -1
  for (let i = 0; i < currentSeries.length; i++) {
    if (currentSeries[i].type === 'map3D') {
      map3DIndex = i
      break
    }
  }

  // 准备新的系列数组
  const newSeries = []

  // 如果存在3D地图系列，保留它
  if (map3DIndex >= 0) {
    newSeries.push(currentSeries[map3DIndex])
  }

  // 添加其他需要更新的系列
  newSeries.push(
    {
      //生成一个固定的情报scatter点
      name: '情报点',
      type: 'effectScatter',
      coordinateSystem: 'geo',
      zlevel: 20,
      data: infoList.map((intel) => ({
        name: intel.text,
        value: [...intel.coords, 100], // 假设value的最后一个值是强度
        itemStyle: {
          color: getColorById(intel.id),
          shadowBlur: 10,
          shadowColor: getColorById(intel.id),
        },
      })),
      rippleEffect: {
        brushType: 'stroke',
        scale: 3,
        period: 3,
      },
      symbol: 'circle',
      symbolSize: 15,
    },
    // 连接线
    {
      name: '连接线',
      type: 'lines',
      coordinateSystem: 'geo',
      zlevel: 2,
      polyline: false,
      data: (() => {
        const connections = []
        // Create sequential connections between information points
        for (let i = 0; i < infoList.length - 1; i++) {
          connections.push({
            coords: [infoList[i].coords, infoList[i + 1].coords],
            name: `${infoList[i].id}-${infoList[i + 1].id}`,
            lineStyle: {
              width: 5, // Average value for line width
              color: 'red', // Average value for color
            },
          })
        }
        return connections
      })(),
      lineStyle: {
        color: '#00FFFF',
        // 宽度与linesData中的lineStyle.width相关
        width: 1,
        opacity: 0.6,
        curveness: 0, // 曲线度
        type: 'solid',
      },
      effect: {
        show: true,
        period: 5,
        trailLength: 0.5,
        color: '#fff',
        symbolSize: 5,
      },
    },
  )

  // 更新图表，仅更新series部分，使用notMerge: false确保保留其他配置
  chartInstance.setOption(
    {
      series: newSeries,
    },
    { notMerge: false },
  )
}

// 多个情报推送给一个用户， 用value值在定义线条的粗细
const updateMapPersonalized = () => {
  if (!chartInstance) return

  // // 定义情报列表
  const infoList = [
    {
      id: 1,
      text: '南海地区发现不明舰船活动，建议加强监控。',
      time: '12:45',
      coords: [112, 16], // 南海坐标
      value: 80, // 假设关联度值
      tags: ['南海', '舰船', '监控'], // 标签
    },
    {
      id: 2,
      text: '东北地区电子干扰信号增强，可能影响通讯设备。',
      time: '11:30',
      coords: [128, 45], // 东北地区坐标
      value: 60, // 假设关联度值
      tags: ['东北', '电子干扰', '通讯'], // 标签
    },
    {
      id: 3,
      text: '西部边境例行巡逻发现异常足迹，已派遣人员调查。',
      time: '10:15',
      coords: [88, 40], // 西部边境坐标
      value: 40, // 假设关联度值
      tags: ['西部', '边境', '巡逻'], // 标签
    },
    {
      id: 4,
      text: '东海海域有不明飞行物出现，建议加强空中监控。',
      time: '09:00',
      coords: [122, 30], // 东海坐标
      value: 70, // 假设关联度值
      tags: ['东海', '飞行物', '监控'], // 标签
    },
    {
      id: 5,
      text: '黄海水域发现异常渔船活动，可能涉及非法捕捞。',
      time: '08:20',
      coords: [121, 36], // 黄海坐标
      value: 50, // 假设关联度值
      tags: ['黄海', '渔船', '捕捞'], // 标签
    },
  ]

  defaultInfoList.value = infoList

  // 定义用户
  const relatedUser = {
    id: 1,
    name: '北京用户',
    coords: [116.4, 39.9],
    value: 100,
    tags: ['北京', '用户', '测试'],
  }

  users.value = [relatedUser]
  // 获取当前所有选项
  const currentOption = chartInstance.getOption()
  const currentSeries = currentOption.series

  // 找到3D地图系列的索引
  let map3DIndex = -1
  for (let i = 0; i < currentSeries.length; i++) {
    if (currentSeries[i].type === 'map3D') {
      map3DIndex = i
      break
    }
  }

  // 准备新的系列数组
  const newSeries = []

  // 如果存在3D地图系列，保留它
  if (map3DIndex >= 0) {
    newSeries.push(currentSeries[map3DIndex])
  }

  // 添加其他需要更新的系列
  newSeries.push(
    {
      //生成一个固定的情报scatter点
      name: '情报点',
      type: 'effectScatter',
      coordinateSystem: 'geo',
      zlevel: 20,
      data: infoList.map((intel) => ({
        name: intel.text,
        value: [...intel.coords, 100], // 假设value的最后一个值是强度
        itemStyle: {
          color: getColorById(intel.id),
          shadowBlur: 10,
          shadowColor: getColorById(intel.id),
        },
      })),
      rippleEffect: {
        brushType: 'stroke',
        scale: 3,
        period: 3,
      },
      symbol: 'circle',
      symbolSize: 15,
    },
    {
      name: '用户位置',
      type: 'scatter',
      coordinateSystem: 'geo',
      zlevel: 2,
      data: [
        {
          name: relatedUser.name,
          value: [...relatedUser.coords, relatedUser.value],
          itemStyle: {
            color: '#00FFFF',
            shadowBlur: 5,
          },
        },
      ],
      symbol: 'pin',
      symbolSize: 25,
      label: {
        show: true,
        formatter: '{b}',
        position: 'top',
        distance: 5,
        fontSize: 12,
        color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: [3, 5],
      },
    },
    // 连接线
    {
      name: '连接线',
      type: 'lines',
      coordinateSystem: 'geo',
      zlevel: 2,
      polyline: false,
      data: infoList.map((info) => ({
        coords: [info.coords, relatedUser.coords],
        name: `${info.id}`,
        lineStyle: {
          width: info.value / 10, // 随机值，模拟关联强度
          color: getLineColorByValue(info.value), // 根据用户的 value 值设置颜色
        },
      })),
      lineStyle: {
        color: '#00FFFF',
        // 宽度与linesData中的lineStyle.width相关
        width: 1,
        opacity: 0.6,
        curveness: 0.3,
        type: 'solid',
      },
      effect: {
        show: true,
        period: 5,
        trailLength: 0.5,
        color: '#fff',
        symbolSize: 5,
      },
    },
  )

  // 更新图表，仅更新series部分，使用notMerge: false确保保留其他配置
  chartInstance.setOption(
    {
      series: newSeries,
    },
    { notMerge: false },
  )
}

// 一个情报推送给多个用户
const updateMapCollaborative = () => {
  if (!chartInstance) return

  // // 定义情报列表
  const info = {
    id: 5,
    text: '黄海水域发现异常渔船活动，可能涉及非法捕捞。',
    time: '08:20',
    coords: [121, 36], // 黄海坐标
    value: 50, // 假设关联度值
    tags: ['黄海', '渔船', '捕捞'], // 标签
  }

  defaultInfoList.value = [info]

  // 定义用户
  const relatedUsers = [
    { id: 1, name: '北京用户', coords: [116.4, 39.9], value: 100, tags: ['北京', '用户', '测试'] },
    { id: 2, name: '上海用户', coords: [121.5, 31.2], value: 50, tags: ['上海', '用户', '测试'] },
    { id: 3, name: '广州用户', coords: [113.2, 23.1], value: 10, tags: ['广州', '用户', '测试'] },
    { id: 4, name: '成都用户', coords: [104.06, 30.67], value: 20, tags: ['成都', '用户', '测试'] },
    { id: 5, name: '西安用户', coords: [108.95, 34.27], value: 60, tags: ['西安', '用户', '测试'] },
  ]

  users.value = relatedUsers

  // 获取当前所有选项
  const currentOption = chartInstance.getOption()
  const currentSeries = currentOption.series

  // 找到3D地图系列的索引
  let map3DIndex = -1
  for (let i = 0; i < currentSeries.length; i++) {
    if (currentSeries[i].type === 'map3D') {
      map3DIndex = i
      console.log(`找到3D地图系列，索引为: ${map3DIndex}`)
      break
    }
  }

  // 准备新的系列数组
  const newSeries = []

  // 如果存在3D地图系列，保留它
  if (map3DIndex >= 0) {
    newSeries.push(currentSeries[map3DIndex])
  }

  // 添加其他需要更新的系列
  newSeries.push(
    {
      //生成一个固定的情报scatter点
      name: '情报点',
      type: 'effectScatter',
      coordinateSystem: 'geo',
      zlevel: 20,
      data: [
        {
          name: info.text,
          value: [...info.coords, info.value],
          itemStyle: {
            color: getColorById(info.id),
            shadowBlur: 10,
            shadowColor: getColorById(info.id),
          },
        },
      ],
      rippleEffect: {
        brushType: 'stroke',
        scale: 3,
        period: 3,
      },
      symbol: 'circle',
      symbolSize: 15,
    },
    {
      name: '用户位置',
      type: 'scatter',
      coordinateSystem: 'geo',
      zlevel: 2,
      data: relatedUsers.map((relatedUser) => ({
        name: relatedUser.name,
        value: [...relatedUser.coords, relatedUser.value],
        itemStyle: {
          color: '#00FFFF',
          shadowBlur: 5,
        },
      })),
      symbol: 'pin',
      symbolSize: 25,
      label: {
        show: true,
        formatter: '{b}',
        position: 'top',
        distance: 5,
        fontSize: 12,
        color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: [3, 5],
      },
    },
    // 连接线
    {
      name: '连接线',
      type: 'lines',
      coordinateSystem: 'geo',
      zlevel: 2,
      polyline: false,
      data: relatedUsers.map((user) => ({
        coords: [info.coords, user.coords],
        name: `${user.name}`,
        lineStyle: {
          width: 1,
          color: 'red',
        },
      })),
      lineStyle: {
        color: '#00FFFF',
        // 宽度与linesData中的lineStyle.width相关
        width: 1,
        opacity: 0.6,
        curveness: 0.3,
        type: 'solid',
      },
      effect: {
        show: true,
        period: 5,
        trailLength: 0.5,
        color: '#fff',
        symbolSize: 5,
      },
    },
  )

  // 更新图表，仅更新series部分，使用notMerge: false确保保留其他配置
  chartInstance.setOption(
    {
      series: newSeries,
    },
    { notMerge: false },
  )
}

onMounted(() => {
  initChart()

  // Initialize target chart if algorithm is crossDomain
  if (props.algorithm === 'crossDomain') {
    nextTick(() => {
      initTargetBarChart()
    })
  }
})

// Update onUnmounted to dispose the target chart
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  if (targetChartInstance) {
    targetChartInstance.dispose()
  }
  window.removeEventListener('resize', handleResize)
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style lang="less" scoped>
.map-container-wrapper {
  position: relative;
  width: 100%;
  height: calc(100vh - 64px);
}

.china-map-container {
  width: 100%;
  height: 100%;
}

// 通用面板样式
.panel {
  position: absolute;
  width: 350px;
  background-color: rgba(0, 21, 41, 0.8);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;

  h3 {
    color: white;
    margin-top: 0;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
}

// 用户信息面板样式
.user-info-panel {
  .panel;
  top: 20px;
  left: 10px;
}

// 情报信息面板样式
.info-panel {
  .panel;
  top: 20px;
  right: 10px;
}

.info-list {
  // max-height: 500px;
  overflow-y: auto;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
  padding: 4px;
  border-radius: 4px;
  width: 100%;

  &.active,
  &:hover {
    background-color: rgba(0, 123, 255, 0.2);
  }
}

.info-text {
  flex: 1;
}

.info-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

:deep(.ant-list-item) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  flex-direction: column;
  align-items: flex-start;
}

.intel-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  border: none;
  padding: 0;
}

/* 去除tag的默认边框和背景 */
:deep(.intel-dot .ant-tag) {
  border: none;
  padding: 0;
}

/* 标签容器样式 */
.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
  width: 100%;
  padding-left: 20px;
  /* 与点的位置对齐 */

  :deep(.ant-tag) {
    margin-right: 0;
    font-size: 11px;
    padding: 0 6px;
    border-radius: 10px;
  }
}

/* 用户列表样式 */
.user-list {
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
  padding: 4px;
  border-radius: 4px;
  width: 100%;

  &.active,
  &:hover {
    background-color: rgba(0, 123, 255, 0.2);
  }
}

.location-icon {
  font-size: 16px;
  // 添加发光效果
  text-shadow: 0 0 8px currentColor;
  color: rgba(0, 123, 255, 0.8);
}

.user-name {
  flex: 1;
}

.user-value {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  background-color: rgba(0, 123, 255, 0.3);
  padding: 2px 6px;
  border-radius: 10px;
}

// 算法详情按钮样式
.algorithm-detail-btn {
  width: 100%; // 与情报信息面板宽度一致
  margin-top: 16px; // 增加与上方列表的间距
  font-size: 18px; // 设置字体大小
  font-weight: bold; // 加粗字体
  height: auto; // 自适应高度
  padding: 10px 0; // 上下增加内边距使按钮更高
  border-radius: 6px; // 圆角边框
  background: linear-gradient(45deg, #1890ff, #2c5baf); // 渐变背景
  border: none; // 移除边框
  animation: pulse 1.5s infinite; // 添加闪动动画

  // 悬停效果
  &:hover {
    background: linear-gradient(45deg, #40a9ff, #4c77cc); // 更亮的渐变色
    box-shadow: 0 0 15px rgba(24, 144, 255, 0.6); // 悬停时增加发光效果
    animation: none; // 悬停时停止动画
  }
}

// 闪动动画定义
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
    transform: scale(1);
  }

  50% {
    box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
    transform: scale(1.02);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
    transform: scale(1);
  }
}

.target-bar-chart {
  width: 100%;
  height: 300px;
  background-color: rgba(0, 21, 41, 0.8);
  border-radius: 8px;
  padding: 12px;
}
</style>
