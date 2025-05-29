<template>
  <div class="map-container-wrapper">
    <div ref="mapContainer" class="china-map-container"></div>

    <!-- 左上角信息列表 -->
    <div class="info-panel">
      <h3>实时情报</h3>
      <a-list class="info-list" :data-source="infoList" :bordered="false">
        <template #renderItem="{ item, index }">
          <a-list-item @click="activateIntel(index)">
            <div class="info-item" :class="{ active: activeIntelIndex === index }">
              <a-tag class="intel-dot" :style="{
                backgroundColor: item.level === 'high' ? '#ff0000' :
                  item.level === 'medium' ? '#ff9800' : '#2196f3',
                boxShadow: `0 0 10px ${item.level === 'high' ? '#ff0000' :
                  item.level === 'medium' ? '#ff9800' : '#2196f3'}`
              }"></a-tag>
              <span class="info-text">{{ item.text }}</span>
              <span class="info-time">{{ item.time }}</span>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, reactive, watch } from 'vue';
import * as echarts from 'echarts/core';
import { MapChart, EffectScatterChart, ScatterChart, LinesChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GeoComponent,
  VisualMapComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { use } from 'echarts/core';
import 'echarts-gl';
import { Tag, List } from 'ant-design-vue';

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
  CanvasRenderer
]);

// 用户位置数据
const users = [
  { id: 1, name: '北京用户', coords: [116.4, 39.9], value: 100 },
  { id: 2, name: '上海用户', coords: [121.5, 31.2], value: 80 },
  { id: 3, name: '广州用户', coords: [113.2, 23.1], value: 90 },
  { id: 4, name: '成都用户', coords: [104.06, 30.67], value: 70 },
  { id: 5, name: '西安用户', coords: [108.95, 34.27], value: 60 }
];

// 情报列表数据 - 包含坐标和相关用户
const infoList = reactive([
  {
    id: 1,
    level: 'high',
    text: '南海地区发现不明舰船活动，建议加强监控。',
    time: '12:45',
    coords: [112, 16], // 南海坐标
    relatedUsers: [1, 2, 3] // 关联的用户ID
  },
  {
    id: 2,
    level: 'medium',
    text: '东北地区电子干扰信号增强，可能影响通讯设备。',
    time: '11:30',
    coords: [128, 45], // 东北地区坐标
    relatedUsers: [1, 4] // 关联的用户ID
  },
  {
    id: 3,
    level: 'low',
    text: '西部边境例行巡逻发现异常足迹，已派遣人员调查。',
    time: '10:15',
    coords: [88, 40], // 西部边境坐标
    relatedUsers: [5, 4] // 关联的用户ID
  }
]);

// 当前激活的情报索引
const activeIntelIndex = ref(0);

// 激活指定情报
const activateIntel = (index: number) => {
  activeIntelIndex.value = index;
  updateMapVisualizations();
};

// 模拟列表滚动更新
const updateInfoList = () => {
  const intervalId = setInterval(() => {
    // 移除第一项并添加到末尾，实现循环滚动效果
    const firstItem = infoList.shift();
    if (firstItem) {
      infoList.push({
        ...firstItem,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      });
      // 保持激活索引不变
      updateMapVisualizations();
    }
  }, 10000); // 每10秒更新一次

  return intervalId;
};

const mapContainer = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
let updateInterval: number | null = null;

// 更新地图可视化
const updateMapVisualizations = () => {
  if (!chartInstance) return;

  const activeIntel = infoList[activeIntelIndex.value];

  // 获取当前情报关联的用户
  const relatedUsers = users.filter(user => activeIntel.relatedUsers.includes(user.id));

  // 生成连接线数据
  const linesData = relatedUsers.map(user => ({
    coords: [activeIntel.coords, user.coords],
    name: `${activeIntel.text.substring(0, 10)}... -> ${user.name}`,
    value: user.value,
    lineStyle: {
      width: activeIntel.level === 'high' ? 2 : 1,
      opacity: activeIntel.level === 'high' ? 0.8 : 0.6
    }
  }));

  // 获取当前所有选项
  const currentOption = chartInstance.getOption();
  const currentSeries = currentOption.series;

  // 找到3D地图系列的索引
  let map3DIndex = -1;
  for (let i = 0; i < currentSeries.length; i++) {
    if (currentSeries[i].type === 'map3D') {
      map3DIndex = i;
      break;
    }
  }

  // 准备新的系列数组
  const newSeries = [];

  // 如果存在3D地图系列，保留它
  if (map3DIndex >= 0) {
    newSeries.push(currentSeries[map3DIndex]);
  }

  // 添加其他需要更新的系列
  newSeries.push(
    // 情报点
    {
      name: '情报点',
      type: 'effectScatter',
      coordinateSystem: 'geo',
      zlevel: 2,
      data: [{
        name: activeIntel.text,
        value: [...activeIntel.coords, 100],
        itemStyle: {
          color: activeIntel.level === 'high' ? '#ff0000' :
            activeIntel.level === 'medium' ? '#ff9800' : '#2196f3',
          shadowBlur: 10,
          shadowColor: activeIntel.level === 'high' ? '#ff0000' :
            activeIntel.level === 'medium' ? '#ff9800' : '#2196f3'
        }
      }],
      rippleEffect: {
        brushType: 'stroke',
        scale: activeIntel.level === 'high' ? 4 : 3,
        period: activeIntel.level === 'high' ? 2 : 3
      },
      symbol: 'circle',
      symbolSize: activeIntel.level === 'high' ? 18 : 15,
      hoverAnimation: true
    },

    // 用户位置标记
    {
      name: '用户位置',
      type: 'scatter',
      coordinateSystem: 'geo',
      zlevel: 2,
      data: relatedUsers.map(user => ({
        name: user.name,
        value: [...user.coords, user.value],
        itemStyle: {
          color: '#00FFFF',
          shadowBlur: 5
        }
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
        padding: [3, 5]
      }
    },

    // 连接线
    {
      name: '连接线',
      type: 'lines',
      coordinateSystem: 'geo',
      zlevel: 2,
      polyline: false,
      data: linesData,
      lineStyle: {
        color: activeIntel.level === 'high' ? 'rgba(255, 0, 0, 0.6)' :
          activeIntel.level === 'medium' ? 'rgba(255, 152, 0, 0.6)' : 'rgba(33, 150, 243, 0.6)',
        width: 1,
        opacity: 0.6,
        curveness: 0.3,
        type: 'solid'
      },
      effect: {
        show: true,
        period: 5,
        trailLength: 0.5,
        color: '#fff',
        symbolSize: 5
      }
    }

  );

  // 更新图表，仅更新series部分，使用notMerge: false确保保留其他配置
  chartInstance.setOption({
    series: newSeries
  }, { notMerge: false });
};

const initChart = () => {
  if (!mapContainer.value) return;

  // 初始化ECharts实例
  chartInstance = echarts.init(mapContainer.value, 'dark');

  // 注册中国地图数据
  fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
    .then(response => response.json())
    .then(chinaJson => {
      echarts.registerMap('China', chinaJson);

      // 初始图表配置
      const option = {
        title: {
          text: '情报推荐演示',
          left: 'center',
          textStyle: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'normal'
          },
          top: 20
        },
        geo: {
          map: 'China',
          roam: false,
          zoom: 1.2,
          itemStyle: {
            areaColor: 'rgba(0,0,0,0)',
            borderColor: 'rgba(0,0,0,0)'
          },
          emphasis: {
            itemStyle: {
              areaColor: 'rgba(0,0,0,0)', // 鼠标悬停时的样式
              borderColor: 'rgba(0,0,0,0)' // 鼠标悬停时的样式
            }
          },
          silent: true // 禁用鼠标事件
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}'
        },
        visualMap: {
          min: 0,
          max: 100,
          show: true,
          calculable: true,
          // inRange: {
          //   color: ['#1e63b0', '#2b85e4', '#38a0eb', '#59c3ff', '#89daff'],
          // },
          textStyle: {
            color: '#fff'
          },
          left: 30,
          bottom: 30
        },
        series: [
          // 3D地图
          {
            type: 'map3D',
            map: 'China',
            shading: 'lambert',
            realisticMaterial: {
              roughness: 0.2, // 粗糙度
              metalness: 10 // 金属度
            },
            light: {
              main: {
                color: '#1E63B0',  // 主光源颜色
                intensity: 1.0, // 主光源强度
                shadow: true, // 是否开启阴影
                shadowQuality: 'high'
              },
              ambient: {
                color: '#0a2463', // 环境光颜色
                intensity: 0.5 // 环境光强度
              }
            },
            viewControl: {
              distance: 80,
              alpha: 50,
              beta: 10,
              autoRotate: false,
              rotateSensitivity: 0,
              zoomSensitivity: 0,
              panSensitivity: 0,
              damping: 0
            },
            label: {
              show: true,
              formatter: '{b}',
              textStyle: {
                color: '#fff',
                fontSize: 12,
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: [5, 5]
              },
              distance: 0,
              position: 'center'
            },
            itemStyle: {
              areaColor: '#1e3799', // 地图区域颜色
              borderColor: '#0FFFFF',
              borderWidth: 1,
              opacity: 0.8
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14
              },
              itemStyle: {
                areaColor: '#4D9FFF'
              }
            },
            regions: [
              {
                name: '南海诸岛',
                itemStyle: {
                  areaColor: '#1E63B0',
                  borderColor: '#0FFFFF'
                },
                label: {
                  show: true,
                  color: '#fff'
                },
                emphasis: {
                  itemStyle: {
                    areaColor: '#4D9FFF'
                  }
                }
              },
              // 添加东海标签
              {
                name: '东海',
                itemStyle: {
                  areaColor: 'rgba(0,0,0,0)', // 透明填充
                  borderColor: 'rgba(0,0,0,0)' // 透明边框
                },
                label: {
                  show: true,
                  color: '#0FFFFF',
                  fontSize: 16,
                  fontWeight: 'bold',
                  position: 'middle',
                  formatter: '东海',
                  distance: -10
                }
              },
              // 添加南海标签
              {
                name: '南海',
                itemStyle: {
                  areaColor: 'rgba(0,0,0,0)',
                  borderColor: 'rgba(0,0,0,0)'
                },
                label: {
                  show: true,
                  color: '#0FFFFF',
                  fontSize: 16,
                  fontWeight: 'bold',
                  position: 'middle',
                  formatter: '南海',
                  distance: -10
                }
              },
              // 添加黄海标签
              {
                name: '黄海',
                itemStyle: {
                  areaColor: 'rgba(0,0,0,0)',
                  borderColor: 'rgba(0,0,0,0)'
                },
                label: {
                  show: true,
                  color: '#0FFFFF',
                  fontSize: 16,
                  fontWeight: 'bold',
                  position: 'middle',
                  formatter: '黄海',
                  distance: -10
                }
              }

            ]
          }
        ]
      };

      chartInstance?.setOption(option);

      // 初始化地图可视化
      updateMapVisualizations();
    });

  // 处理窗口调整大小
  window.addEventListener('resize', handleResize);
};

const handleResize = () => {
  chartInstance?.resize();
};

onMounted(() => {
  initChart();
  updateInterval = updateInfoList();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  window.removeEventListener('resize', handleResize);
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});
</script>

<style scoped>
.map-container-wrapper {
  position: relative;
  width: 100%;
  height: calc(100vh - 64px);
}

.china-map-container {
  width: 100%;
  height: 100%;
}

.info-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 350px;
  background-color: rgba(0, 21, 41, 0.8);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.info-panel h3 {
  color: white;
  margin-top: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.info-list {
  max-height: 300px;
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
}

.info-item.active,
.info-item:hover {
  background-color: rgba(0, 123, 255, 0.2);
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
}

:deep(.ant-tag) {
  margin-right: 0;
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
</style>