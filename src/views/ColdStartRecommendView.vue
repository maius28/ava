<template>
  <div class="recommend-view">
    <!-- 左侧用户列表 -->
    <div class="user-list-container">
      <!-- 下拉选择区域 -->
      <a-select v-model:value="selectedRegion" placeholder="请选择区域" style="width: 100%; margin-bottom: 16px;"
        @change="filterUsers">
        <a-select-option v-for="region in regions" :key="region" :value="region">
          {{ region }}
        </a-select-option>
      </a-select>
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
      <!-- 推荐参数输入与进度条 -->
      <div class="recommend-params-container">
        <div class="params-row">
          <span style="margin-right: 10px;">兴趣偏好数量</span>
          <a-input-number v-model:value="interestCount" :min="1" :max="10" :default-value="3"
            style="width: 160px; margin-right: 16px;" />
          <span style="margin-right: 10px;">拟推荐数量</span>
          <a-input-number v-model:value="recommendCount" :min="1" :max="10" :default-value="3"
            style="width: 160px; margin-right: 16px;" />
          <a-button type="primary" :loading="recommending" @click="startRecommend">推荐</a-button>
        </div>
        <a-steps :current="currentStep" class="extraction-steps" style="margin-top: 16px; width: 80%;">
          <a-step title="用户数据查询" />
          <a-step title="用户历史数据查询" />
          <a-step title="模型数据载入" />
          <a-step title="数据推荐" />
          <a-step title="数据拟推荐" />
        </a-steps>
        <div class="progress-container">
          <a-progress :percent="progress" :status="progressStatus" />
          <div class="progress-info" v-if="progress === 100">推荐完成</div>
          <div class="progress-info" v-else>{{ progressInfo }}</div>
        </div>
      </div>
      <!-- 流程图 -->
      <div v-if="progress === 100">
        <div class="recommend-result-box">
          <div>拟推荐情报8，情报9，匹配准确率：96%，匹配理由:xxxxxxx</div>
        </div>
        <div class="flowchart-container">
          <div id="flowchart" class="flowchart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';

// 区域列表
const regions = ref(['全部区域', '南海海域', '东海海域', '黄海海域', '渤海海域']);

// 当前选中的区域
const selectedRegion = ref('全部区域');

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
const selectedUser = ref<UserItem | null>(null);

const filteredUsers = computed(() => {
  if (!selectedRegion.value || selectedRegion.value === '全部区域') return users.value;
  return users.value.filter(user => user.region === selectedRegion.value);
});

const filterUsers = () => {
  // 当区域变化时，重置选中用户
  selectedUser.value = null;
};

const interestCount = ref(3);
const recommendCount = ref(3);
const progress = ref(0);
const recommending = ref(false);

const steps = [
  '用户数据查询',
  '用户历史数据查询',
  '模型数据载入',
  '数据推荐',
  '数据拟推荐',
];
const currentStep = ref(0);

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
      nextTick(() => {
        renderFlowchart();
      });
    }
  }, 400);
}

// 选中用户
interface UserItem { id: number; name: string; region: string; }
const selectUser = (user: UserItem) => {
  selectedUser.value = user;
  console.log(`选中用户：${user.name}`);
  renderFlowchart();

  // 清空右侧内容
  progress.value = 0;
  currentStep.value = 0;
  recommending.value = false;
  // 如有推荐结果等其他状态，也一并清空
  // 推荐结果区域如果有单独的变量，也要清空
};

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
      formatter: function (params) {
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
        { name: '情报1', x: 0, y: 200, label: { show: true }, tooltip: "情报详细内容,xxxxx" },
        { name: '情报2', x: 100, y: 200, label: { show: true } },
        { name: '情报3', x: 200, y: 200, label: { show: true } },
        { name: '情报4', x: 100, y: 160, label: { show: true } },
        { name: '情报5', x: 100, y: 130, label: { show: true } },
        { name: '情报6', x: 300, y: 200, label: { show: true } },
        { name: '情报7', x: 200, y: 230, label: { show: true } },
        { name: '情报8', x: 200, y: 260, label: { show: true } },
        { name: '情报9', x: 300, y: 260, label: { show: true } },
      ],
      links: [
        { source: '情报1', target: '情报4', lineStyle: { type: 'dashed' }, label: { show: true, formatter: '匹配度0.6' } },
        { source: '情报1', target: '情报5', lineStyle: { type: 'dashed' }, label: { show: true, formatter: '匹配度0.6' } },
        { source: '情报1', target: '情报2' },
        { source: '情报2', target: '情报3' },
        { source: '情报3', target: '情报6', lineStyle: { type: 'dashed' }, label: { show: true, formatter: '匹配度0.6' } },
        { source: '情报2', target: '情报7', lineStyle: { type: 'dashed' }, label: { show: true, formatter: '匹配度0.6' } },
        { source: '情报2', target: '情报8', lineStyle: { type: 'dashed', color: 'red' }, label: { show: true, formatter: '匹配度0.7', color: 'red' } },
        { source: '情报3', target: '情报9', lineStyle: { type: 'dashed', color: 'red' }, label: { show: true, formatter: '匹配度0.8', color: 'red' } },
      ],
      lineStyle: {
        color: '#333',
        width: 2
      }
    }]
  };

  myChart.setOption(option);
};

const progressStatus = computed(() => {
  if (progress.value === 100) return 'success';
  return 'active';
});
const progressInfo = computed(() => {
  if (progress.value === 100) return '推荐完成';
  if (recommending.value) return steps[currentStep.value] + '中...';
  return '准备就绪';
});

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

.recommend-params-container {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  position: relative;
  min-height: 120px;
}

.params-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
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
  height: 600px;
}

.selected-region {
  margin-bottom: 16px;
  font-size: 14px;
  color: #333;
}

.extraction-steps {
  margin: 24px 0 36px;
}

.progress-container {
  margin-bottom: 36px;
}

.progress-info {
  margin-top: 8px;
  text-align: center;
  color: #666;
  font-size: 16px;
  font-weight: 500;
}

.recommend-result-box {
  background: #f6faff;
  border: 1px solid #d6e4ff;
  border-radius: 6px;
  padding: 16px;
  margin-top: 24px;
  margin-bottom: 16px;
  font-size: 16px;
  color: #1d39c4;
  font-weight: 500;
}
</style>
