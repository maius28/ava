<template>
  <a-page-header title="第二种算法" subTitle="使用xx算法" @back="() => { }"></a-page-header>
  <div class="recommend-view">
    <!-- 左侧用户列表 -->
    <div class="user-list-container">
      <!-- 下拉选择区域 -->
      <a-select v-model:value="selectedRegion" placeholder="选择区域" style="width: 100%; margin-bottom: 16px;"
        @change="filterUsers">
        <a-select-option v-for="region in regions" :key="region" :value="region">
          {{ region }}
        </a-select-option>
      </a-select>
      <!-- 显示当前选中的区域 -->
      <div v-if="selectedRegion" class="selected-region">
        当前选中区域：<strong>{{ selectedRegion }}</strong>````````````
      </div>
      <!-- 用户列表 -->
      <a-list bordered :data-source="filteredUsers" class="user-list">
        <template #renderItem="{ item }">
          <a-list-item @click="selectUser(item)">
            <a>{{ item.name }}</a>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <!-- 右侧信息展示区域 -->
    <div class="info-display-container">
      <!-- 时间轴图 -->
      <div class="custom-timeline-container">
        <div class="timeline-header">历史信息</div>
        <div class="timeline-horizontal">
          <div class="timeline-arrow"></div>
          <div class="timeline-points">
            <div v-for="(event, idx) in timelineEvents" :key="idx" class="timeline-point"
              :style="{ left: event.position + '%' }">
              <div class="timeline-card">
                <div>查看编号{{ event.id }}消息</div>
                <div>消息内容：{{ event.content }}</div>
              </div>
              <div class="timeline-dot"></div>
              <div class="timeline-date">{{ event.time }}</div>
            </div>
          </div>
          <div class="timeline-years">
            <span class="timeline-year" style="left:0%">2024年</span>
            <span class="timeline-year" style="right:0%">2025年</span>
          </div>
        </div>
      </div>

      <!-- 流程图 -->
      <div class="flowchart-container">
        <div id="flowchart" class="flowchart"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import * as echarts from 'echarts';

// 区域列表
const regions = ref(['南海海域', '东海海域', '黄海海域', '渤海海域']);

// 当前选中的区域
const selectedRegion = ref('');

// 用户数据
const users = ref([
  { id: 1, name: '南海舰队', region: '南海海域' },
  { id: 2, name: '东海舰队', region: '东海海域' },
  { id: 3, name: '黄海舰队', region: '黄海海域' },
  { id: 4, name: '渤海舰队', region: '渤海海域' },
  { id: 5, name: '南海侦察部队', region: '南海海域' },
  { id: 6, name: '南海指挥部', region: '南海海域' },
  { id: 7, name: '南海海军', region: '南海海域' },
  { id: 8, name: '南海空军', region: '南海海域' },
]);

// 当前选中的用户
const selectedUser = ref(null);

const filteredUsers = computed(() => {
  if (!selectedRegion.value) return users.value;
  return users.value.filter(user => user.region === selectedRegion.value);
});

// 选中用户的时间轴数据
const selectedUserTimeline = computed(() => {
  if (!selectedUser.value) return [];
  return userTimelines.value[selectedUser.value.id] || [];
});

// 渲染用户列表项
const renderUserItem = (user) => {

};

const filterUsers = () => {
  // 当区域变化时，重置选中用户
  selectedUser.value = null;
};

// 选中用户
const selectUser = (user) => {
  selectedUser.value = user;
  console.log(`选中用户：${user.name}`);
  renderFlowchart();
};

// 渲染流程图
const renderFlowchart = () => {
  const chartDom = document.getElementById('flowchart');
  if (!chartDom) return;

  const myChart = echarts.init(chartDom);

  const data = {
    name: '这是什么',
    children: [
      {
        name: '这是什么',
        children: [
          {
            name: 'converters',
            children: [
              { name: 'Converters', value: 721 },
              { name: 'DelimitedTextConverter', value: 4294 }
            ]
          },
          {
            name: 'DataUtil',
            value: 3322
          }
        ]
      },
      {
        name: 'display',
        children: [
          { name: 'DirtySprite', value: 8833 },
          { name: 'LineSprite', value: 1732 },
          { name: 'RectSprite', value: 3623 }
        ]
      },
      {
        name: 'flex',
        children: [{ name: 'FlareVis', value: 4116 }]
      },
    ]
  };

  const option = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [
      {
        type: 'tree',
        id: 0,
        name: 'tree1',
        data: [data],

        top: '10%',
        left: '8%',
        bottom: '22%',
        right: '20%',

        symbolSize: 7,

        edgeShape: 'polyline',
        edgeForkPosition: '63%',
        initialTreeDepth: 3,

        lineStyle: {
          width: 2
        },

        label: {
          backgroundColor: '#fff',
          position: 'left',
          verticalAlign: 'middle',
          align: 'right'
        },

        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left'
          }
        },

        emphasis: {
          focus: 'descendant'
        },

        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750
      }
    ]
  };




  myChart.setOption(option);
};

const timelineEvents = [
  { id: 1000, content: 'xxxxxxxxxx', time: '2024-04', position: 25 },
  { id: 1001, content: 'xxxxxxxxxx', time: '2024-08', position: 60 },
  { id: 1003, content: 'xxxxxxxxxx', time: '2024-12', position: 90 },
];
// position 为百分比，决定点在时间轴上的位置（0~100）

onMounted(() => {
  renderFlowchart();
});
</script>

<style scoped>
.recommend-view {
  display: flex;
  height: 100vh;
}

.user-list-container {
  width: 25%;
  padding: 16px;
  background-color: #f0f2f5;
  border-right: 1px solid #e8e8e8;
}

.user-list {
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.info-display-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.custom-timeline-container {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  position: relative;
  min-height: 400px;
}

.timeline-header {
  text-align: center;
  font-weight: bold;
  margin-bottom: 16px;
}

.timeline-horizontal {
  position: relative;
  height: 200px;
  margin-top: 100px;
}

.timeline-arrow {
  position: absolute;
  top: 60px;
  left: 5%;
  width: 90%;
  height: 2px;
  background: #222;
}

.timeline-arrow::after {
  content: '';
  position: absolute;
  right: -10px;
  top: -5px;
  border: 8px solid transparent;
  border-left: 14px solid #222;
}

.timeline-points {
  position: absolute;
  top: 0;
  left: 5%;
  width: 90%;
  height: 120px;
}

.timeline-point {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  width: 160px;
}

.timeline-card {
  background: #fff;
  border: 1px solid #aaa;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  min-width: 120px;
}

.timeline-dot {
  width: 14px;
  height: 14px;
  background: #fff;
  border: 3px solid #222;
  border-radius: 50%;
  margin: 0 auto;
}

.timeline-date {
  text-align: center;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

.timeline-years {
  position: absolute;
  top: 90px;
  left: 5%;
  width: 90%;
  pointer-events: none;
}

.timeline-year {
  position: absolute;
  font-size: 14px;
  color: #333;
  font-weight: bold;
}

.flowchart-container {
  flex: 1;
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.flowchart {
  width: 100%;
  height: 100%;
}

.selected-region {
  margin-bottom: 16px;
  font-size: 14px;
  color: #333;
}
</style>