<template>
  <!-- 顶部切换标签 -->
  <div class="top-tabs">
    <a-button :type="activeTab === 'similar' ? 'primary' : 'default'" @click="activeTab = 'similar'"
      style="margin-right: 12px;">
      相似性推荐
    </a-button>
    <a-button :type="activeTab === 'vector' ? 'primary' : 'default'" @click="activeTab = 'vector'">
      向量化推荐
    </a-button>
  </div>
  <div class="main-content">
    <!-- 左侧情报画像查询区 -->
    <div class="left-panel">
      <div class="query-box">
        <h3>情报选择</h3>
        <a-select v-model:value="selectedIntelId" show-search placeholder="请选择或输入情报ID" :filter-option="false"
          :options="intelOptions" @search="onIntelSearch" @change="onIntelSelect" style="width: 100%;" />
      </div>
      <div v-if="intelInfo" class="intel-info-card">
        <div class="intel-content">{{ intelInfo.content }}</div>
        <div class="intel-meta">
          <div>情报来源：{{ intelInfo.source }}</div>
          <div>目标舰机型：{{ intelInfo.targetType }}</div>
          <div>时间：{{ intelInfo.time }}</div>
          <div>地区：{{ intelInfo.region }}</div>
        </div>
        <div class="intel-relation">
          <div>关系：</div>
          <div v-for="(rel, idx) in intelInfo.relations" :key="idx">{{ rel }}</div>
        </div>
      </div>
      <div class="relation-graph-box" v-if="intelInfo">
        <RelationGraph :graphData="graphData" height="260px" />
      </div>
    </div>
    <!-- 右侧内容区 -->
    <div class="right-panel" v-if="intelInfo">
      <div class="recommend-action-box" style="display: flex; align-items: right; justify-content: space-between;">
        <a-button type="primary" :loading="recommending" @click="startRecommend">推荐</a-button>
      </div>
      <a-steps :current="currentStep" class="extraction-steps" style="margin-bottom: 16px;">
        <a-step title="扫描候选" />
        <a-step title="智能排序" />
        <a-step title="优化结果" />
      </a-steps>
      <div class="progress-container">
        <a-progress :percent="progress" :status="progressStatus" />
        <div class="progress-info">{{ progressInfo }}</div>
      </div>
      <div v-if="progress === 100" class="match-result-box">
        匹配准确率：91.33%
      </div>
      <div v-if="progress === 100" class="relation-graph-box">
        <div id="flowchart" class="flowchart"></div>
      </div>
      <div v-if="progress === 100" class="recommend-users-box">
        <h3>推荐用户</h3>
        <div class="user-list">
          <a-button v-for="user in recommendUsers" :key="user.name"
            :type="selectedUser && selectedUser.name === user.name ? 'primary' : 'default'" @click="selectUser(user)"
            style="margin-bottom: 8px; width: 100%;">
            {{ user.name }}
          </a-button>
        </div>
        <div v-if="selectedUser" class="user-pie-chart">
          <div ref="pieChartRef" style="width: 300px; height: 300px;"></div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import RelationGraph from '@/components/RelationGraph.vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

interface IntelInfo {
  id: string;
  content: string;
  source: string;
  targetType: string;
  time: string;
  region: string;
  relations: string[];
}

interface UserPie {
  name: string;
  pie: { value: number; name: string }[];
}

const activeTab = ref<'similar' | 'vector'>('similar');
const intelInfo = ref<IntelInfo | null>(null);
const selectedIntelId = ref('');
const intelOptions = ref<{ label: string; value: string }[]>([{ label: '情报1', value: '情报1' }]);

// 模拟情报ID数据
const allIntels: IntelInfo[] = [
  { id: '情报1', content: '情报内容：歼-16战机执行巡逻任务。', source: '光学卫星', targetType: '歼-16战斗机', time: '20xx-09-22', region: '东海', relations: ['歼-16战机 执行 巡逻任务', '巡逻任务 执行于 东海'] },
  { id: '情报2', content: '情报内容：歼-20战机执行侦察任务。', source: '雷达', targetType: '歼-20战斗机', time: '20xx-09-23', region: '南海', relations: ['歼-20战机 执行 侦察任务', '侦察任务 执行于 南海'] },
  { id: '情报3', content: '情报内容：轰-6K执行打击任务。', source: '卫星', targetType: '轰-6K', time: '20xx-09-24', region: '黄海', relations: ['轰-6K 执行 打击任务', '打击任务 执行于 黄海'] },
];

function onIntelSearch(val: string) {
  // 模拟搜索
  intelOptions.value = allIntels
    .filter(item => item.id.includes(val))
    .map(item => ({ label: item.id, value: item.id }));
}

function onIntelSelect(val: string) {
  const found = allIntels.find(item => item.id === val);
  if (found) {
    intelInfo.value = found;
    // 可根据情报内容动态生成关系图数据
    // graphData.value = ...
    renderFlowchart()
  } else {
    intelInfo.value = null;
  }
}

const graphData = ref({
  nodes: [
    { name: '歼-16战机', x: 100, y: 100 },
    { name: '情报1', x: 300, y: 300 },
    { name: '2023-09-22', x: 500, y: 100 },
    { name: '东海', x: 500, y: 500 },
    { name: '巡逻任务', x: 100, y: 500 }
  ],
  links: [
    { source: '情报1', target: '歼-16战机', label: { show: true, formatter: '目标舰机型' } },
    { source: '情报1', target: '2023-09-22', label: { show: true, formatter: '时间' } },
    { source: '情报1', target: '巡逻任务', label: { show: true, formatter: '任务类型' } },
    { source: '情报1', target: '东海', label: { show: true, formatter: '地区' } },
    { source: '巡逻任务', target: '东海', label: { show: true, formatter: '执行于' } },
    { source: '歼-16战机', target: '巡逻任务', label: { show: true, formatter: '执行' } },
  ]
});

const recommendUsers = ref<UserPie[]>([
  {
    name: '用户A', pie: [
      { value: 40, name: '标签1' },
      { value: 30, name: '标签2' },
      { value: 20, name: '标签3' },
      { value: 10, name: '标签4' },
    ]
  },
  {
    name: '用户B', pie: [
      { value: 50, name: '标签1' },
      { value: 20, name: '标签2' },
      { value: 15, name: '标签3' },
      { value: 15, name: '标签4' },
    ]
  },
  {
    name: '用户C', pie: [
      { value: 25, name: '标签1' },
      { value: 25, name: '标签2' },
      { value: 25, name: '标签3' },
      { value: 25, name: '标签4' },
    ]
  },
]);

const selectedUser = ref<UserPie | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);
let pieChart: echarts.ECharts | null = null;

const steps = [
  '扫描候选',
  '智能排序',
  '优化结果',
];
const currentStep = ref(0);
const progress = ref(0);
const recommending = ref(false);

const progressStatus = computed(() => {
  if (progress.value === 100) return 'success';
  return 'active';
});
const progressInfo = computed(() => {
  if (progress.value === 100) return '推荐完成';
  if (recommending.value) return steps[currentStep.value] + '中...';
  return '准备就绪';
});

function startRecommend() {
  progress.value = 0;
  currentStep.value = 0;
  recommending.value = true;
  let step = 0;
  const stepCount = steps.length;
  const interval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += 100 / stepCount;
      if (progress.value >= ((step + 1) * 100 / stepCount) && step < stepCount - 1) {
        step++;
        currentStep.value = step;
      }
    } else {
      clearInterval(interval);
      progress.value = 100;
      currentStep.value = stepCount - 1;
      recommending.value = false;
      // 推荐完成后默认选中第一个用户
      if (recommendUsers.value.length > 0) {
        selectUser(recommendUsers.value[0]);
      }
      nextTick(() => {
        renderFlowchart();
      });
    }
  }, 400);
}

function selectUser(user: UserPie) {
  selectedUser.value = user;
  nextTick(() => {
    renderPieChart();
  });
}

function renderPieChart() {
  if (!pieChartRef.value) return;
  // 每次都销毁旧实例，防止多次初始化
  if (pieChart) {
    pieChart.dispose();
    pieChart = null;
  }
  pieChart = echarts.init(pieChartRef.value);
  const option = {
    tooltip: { trigger: 'item' },
    legend: { top: 'bottom' },
    series: [
      {
        name: '标签分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, position: 'outside' },
        data: selectedUser.value ? selectedUser.value.pie : [],
      }
    ]
  };
  pieChart.setOption(option);
}


// 渲染流程图
const renderFlowchart = () => {
  const chartDom = document.getElementById('flowchart');
  if (!chartDom) return;
  if (echarts.getInstanceByDom(chartDom)) {
    echarts.dispose(chartDom);
  }
  const myChart = echarts.init(chartDom);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        if (params.data && params.data.tooltip) {
          return params.data.tooltip;
        }
        return params.data ? params.data.name : '';
      }
    },
    series: [{
      type: 'graph',
      layout: 'none',
      symbolSize: 60,
      roam: false,
      label: { show: true },
      edgeSymbol: ['none', 'arrow'],
      edgeSymbolSize: [6, 10],
      data: [
        { name: '情报1', x: 100, y: 200, label: { show: true } },
        { name: '关键词1', x: 100, y: 100, label: { show: true } },
        { name: '关键词2', x: 0, y: 200, label: { show: true } },
        { name: '关键词3', x: 200, y: 200, label: { show: true } },
        { name: '关键词4', x: 100, y: 300, label: { show: true } },
        {
          name: '用户A',
          x: 100,
          y: 0,
          label: {
            show: true,
            position: 'right',
            formatter: '{b}\n{rate|匹配率: 76%}',
            rich: {
              rate: {
                backgroundColor: '#f6faff',
                borderColor: '#d6e4ff',
                borderWidth: 1,
                borderRadius: 4,
                padding: [2, 6],
                color: '#1d39c4',
                fontWeight: 'bold'
              }
            }
          }
        },
        {
          name: '用户B', x: -100, y: 200,
          label: {
            show: true,
            position: 'top',
            formatter: '{b}\n{rate|匹配率: 90%}',
            rich: {
              rate: {
                backgroundColor: '#f6faff',
                borderColor: '#d6e4ff',
                borderWidth: 1,
                borderRadius: 4,
                padding: [2, 6],
                color: '#1d39c4',
                fontWeight: 'bold'
              }
            }
          }
        },
        {
          name: '用户C', x: 300, y: 200, label: {
            show: true,
            position: 'right',
            formatter: '{b}\n{rate|匹配率: 70%}',
            rich: {
              rate: {
                backgroundColor: '#f6faff',
                borderColor: '#d6e4ff',
                borderWidth: 1,
                borderRadius: 4,
                padding: [2, 6],
                color: '#1d39c4',
                fontWeight: 'bold'
              }
            }
          }
        },
      ],
      links: [
        { source: '情报1', target: '关键词1', },
        { source: '情报1', target: '关键词2', },
        { source: '情报1', target: '关键词3' },
        { source: '情报1', target: '关键词4' },
        { source: '关键词1', target: '用户A', lineStyle: { type: 'dashed', color: 'red' } },
        { source: '关键词2', target: '用户B', lineStyle: { type: 'dashed', color: 'red' } },
        { source: '关键词3', target: '用户C', lineStyle: { type: 'dashed', color: 'red' } },
        { source: '关键词4', target: '用户B', lineStyle: { type: 'dashed', color: 'red' } },
      ],
      lineStyle: {
        color: '#333',
        width: 2
      }
    }]
  };

  myChart.setOption(option);
};

watch(selectedUser, () => {
  nextTick(() => renderPieChart());
});

onMounted(() => {
  // 默认不选用户，推荐完成后再选
});
</script>

<style scoped>
.recommend-page {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

.top-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.main-content {
  display: flex;
  gap: 32px;
}

.left-panel {
  width: 340px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  padding: 20px 16px;
  min-height: 400px;
}

.query-box {
  margin-bottom: 18px;
}

.intel-info-card {
  margin-top: 12px;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  padding: 12px;
  background: #f9f9f9;
}

.intel-content {
  font-size: 16px;
  margin-bottom: 10px;
}

.intel-meta {
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
}

.intel-relation {
  font-size: 13px;
  color: #888;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.relation-graph-box {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  padding: 16px;
  margin-bottom: 8px;
}

.recommend-action-box {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  position: relative;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.match-result-box {
  background: #f6faff;
  border: 1px solid #d6e4ff;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  font-size: 16px;
  color: #1d39c4;
  font-weight: 500;
  text-align: center;
}

.recommend-users-box {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  padding: 16px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.user-list {
  min-width: 120px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-pie-chart {
  flex: 1;
  min-width: 260px;
}

.progress-container {
  margin-bottom: 16px;
}

.progress-info {
  font-size: 14px;
  color: #555;
  text-align: center;
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
  height: 400px;
}
</style>
