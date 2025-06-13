<!-- 情报抽取界面 -->
<template>
  <!-- 功能展示区域，展示当前页面的主要功能 -->
  <div class="content">
    <div class="input-section">
      <h2>输入情报文本</h2>
      <div class="input-methods">
        <!-- 文本输入框 -->
        <div class="text-input">
          <a-textarea v-model:value="intelText" placeholder="请输入需要分析的情报文本..." :rows="6"
            :auto-size="{ minRows: 6, maxRows: 10 }" allow-clear />

        </div>

        <!-- 文件上传 -->
        <div class="file-upload">
          <h3>上传情报文件</h3>
          <a-upload :file-list="fileList" :before-upload="beforeUpload" @remove="handleRemove" :maxCount="1">
            <a-button type="primary">
              <upload-outlined /> 上传文本文件
            </a-button>
            <template #itemRender="{ file }">
              <a-tooltip :title="file.name">
                <div class="file-item">
                  <file-text-outlined />
                  <span class="file-name">{{ file.name }}</span>
                  <a-button type="text" danger @click="() => handleRemove(file)">
                    <delete-outlined />
                  </a-button>
                </div>
              </a-tooltip>
            </template>
          </a-upload>
          <div class="upload-hint">支持上传 .txt 格式的文本文件</div>
        </div>
      </div>

      <!-- 开始抽取按钮 -->
      <div class="action-buttons">
        <a-button type="primary" size="large" :disabled="!canExtract" @click="startExtraction" :loading="extracting">
          <template #icon><experiment-outlined /></template>
          开始提取
        </a-button>
      </div>
    </div>

    <!-- 抽取进度与结果 -->
    <div class="extraction-process" v-if="isProcessStarted">
      <h2>提取进度</h2>

      <!-- 步骤条 -->
      <a-steps :current="currentStep" class="extraction-steps">
        <a-step title="提取完毕" description="" />
        <a-step title="实体构建" description="" />
        <a-step title="关系构建" description="" />
        <a-step title="提取可视化" description="" />
      </a-steps>

      <!-- 进度条 -->
      <div class="progress-container">
        <a-progress :percent="progressPercent" :status="progressStatus" />
        <div class="progress-info">{{ progressInfo }}</div>
      </div>

      <div ref="visualizationArea">
        <!-- 原始文本 -->
        <div class="original-text" v-if="currentStep >= 0">
          <h3>token</h3>
          <div class="text-content">
            <span v-for="(token, index) in tokens" :key="index" class="token"
              :style="{ 'background-color': getTokenColor(token, index) }">
              {{ token }}
            </span>
          </div>
        </div>

        <!-- 实体识别 -->
        <div class="entity-recognition" v-if="currentStep >= 1">
          <h3>实体</h3>
          <div class="text-content entities-container">
            <div v-for="(category, catIndex) in entityCategories" :key="catIndex" class="entity-category">
              <span class="category-title">{{ category.name }}：</span>
              <div class="entity-tags">
                <a-tag v-for="(entity, entIndex) in category.entities" :key="entIndex" :color="category.color">
                  {{ entity }}
                </a-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 关系 -->
        <div class="keyword-extraction" v-if="currentStep >= 2">
          <h3>关系</h3>
          <div class="text-content">
            <div>歼-16战机<span style="font-weight: bold;">执行</span>巡逻任务</div>
            <div>巡逻任务<span style="font-weight: bold;">执行于</span>东海</div>
          </div>
        </div>

        <!-- 关系图 -->
        <div class="final-result">
          <div class="text-content " v-if="currentStep >= 3">
            <div id="graph-container" style="height: 300px;">
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>


<script lang="ts" setup>
import { ref, computed, nextTick } from 'vue';
import {
  UploadOutlined,
  FileTextOutlined,
  DeleteOutlined,
  ExperimentOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent } from 'echarts/components';
import { GraphChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, GraphChart, CanvasRenderer]);

// 输入数据
const intelText = ref('光学卫星发现一艘歼-16战机在2023年10月15日14时30分位于东海地区，坐标31.5°N123.2°E，航向120°，航速800公里/小时，隶属于空军，执行巡逻任务。');
const fileList = ref([]);

// 处理状态
const extracting = ref(false);
const isProcessStarted = ref(false);
const currentStep = ref(-1);
const progressPercent = ref(0);
const progressStatus = computed(() => {
  if (currentStep.value >= 4) return 'success';
  return 'active';
});
const progressInfo = ref('准备就绪');

// 抽取结果
const tokens = ref([]);
const entityCategories = ref([]);

// 计算属性
const canExtract = computed(() => {
  return intelText.value.trim().length > 0 || fileList.value.length > 0;
});

// 文件上传处理
const beforeUpload = (file) => {
  const isTxt = file.type === 'text/plain';
  if (!isTxt) {
    message.error('只能上传TXT文件!');
    return false;
  }

  // 读取文件内容
  const reader = new FileReader();
  reader.onload = (e) => {
    intelText.value = e.target.result;
  };
  reader.readAsText(file);

  fileList.value = [file];
  return false; // 阻止自动上传
};

const handleRemove = () => {
  fileList.value = [];
};

const scrollToBottom = () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight, // 滚动到页面底部
    behavior: 'smooth' // 平滑滚动
  });
};

// 开始抽取过程
const startExtraction = async () => {
  // 重置状态
  extracting.value = true;
  isProcessStarted.value = true;
  currentStep.value = -1;
  progressPercent.value = 0;
  progressInfo.value = '正在准备...';

  // 模拟各个步骤的处理过程
  await simulateStep(0, '提取完毕...', 25);
  generateTokens();

  await simulateStep(1, '实体构建...', 50);
  generateEntities();

  await simulateStep(2, '关系构建...', 75);
  generateRelationships();
  // generateKeywords();

  await simulateStep(3, '提取可视化...', 100);
  generateRelationGraph();

  // 完成处理
  progressInfo.value = '提取完成';
  extracting.value = false;

  // 滚动到结果区域
  await nextTick();
  scrollToBottom();
};

// 模拟步骤处理
const simulateStep = async (step, info, progress) => {
  return new Promise(resolve => {
    setTimeout(() => {
      currentStep.value = step;
      progressInfo.value = info;
      progressPercent.value = progress;
      resolve(true);
    }, 1500); // 每个步骤模拟1.5秒
  });
};

// 生成分词结果
const generateTokens = () => {
  const text = intelText.value;
  // 简单分词模拟 - 实际应用中应使用专业分词库
  const words = text.split(/\s+|，|。|；|！|？|,|\.|\?|!|;/).filter(w => w.trim());
  tokens.value = [...new Set(words)]; // 去重
};

// 生成实体识别结果
const generateEntities = () => {
  entityCategories.value = [
    {
      name: '情报来源',
      color: 'blue',
      entities: ['光学卫星']
    },
    {
      name: '目标舰机型',
      color: 'purple',
      entities: ['歼-16战机']
    },
    {
      name: '时间',
      color: 'green',
      entities: ['2023年10月15日14时30分']
    },
    {
      name: '地区',
      color: 'orange',
      entities: ['东海']
    }
  ];
};

//构建关系
const generateRelationships = () => {

};

// 定义颜色数组
const colorPalette = [
  '#ff0000', // 红色
  '#ff4500', // 橙红色
  '#ff8c00', // 橙色
  '#ffd700', // 金黄色
  '#9acd32', // 黄绿色
  '#32cd32', // 绿色
  '#00ced1', // 青色
  '#1e90ff', // 蓝色
  '#4b0082', // 靛蓝色
  '#9400d3', // 紫色
];

// 根据 token 的索引获取颜色
const getTokenColor = (token, index) => {
  return colorPalette[index % colorPalette.length];
};

const generateRelationGraph = () => {
  const chartDom = document.getElementById('graph-container');
  const myChart = echarts.init(chartDom);
  const option = {
    title: {
      text: '关系图'
    },
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        layout: 'none',
        symbolSize: 50,
        roam: true, // 允许缩放和平移
        label: {
          show: true
        },
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [10, 20], // 设置边的符号大小
        edgeLabel: {
          fontSize: 20
        },
        data: [
          {
            name: '歼-16战机',
            x: 100,
            y: 100
          },
          {
            name: '情报10331号',
            x: 300,
            y: 300
          },
          {
            name: '2023年10月15日14时30分',
            x: 500,
            y: 100
          },
          {
            name: '东海',
            x: 500,
            y: 500
          },
          {
            name: '巡逻任务',
            x: 100,
            y: 500
          }
        ],
        links: [
          {
            source: '情报10331号',
            target: '歼-16战机',
            symbolSize: [5, 20],
            label: {
              show: true,
              formatter: '目标舰机型',
            },
          },
          {
            source: '情报10331号',
            target: '2023年10月15日14时30分',
            label: {
              show: true,
              formatter: '时间'
            },
          },
          {
            source: '情报10331号',
            target: '巡逻任务',
            label: {
              show: true,
              formatter: '任务类型'
            },
          },
          {
            source: '情报10331号',
            target: '东海',
            label: {
              show: true,
              formatter: '地区'
            },
          },
          {
            source: '巡逻任务',
            target: '东海',
            label: {
              show: true,
              formatter: '执行于'
            },
          },
          {
            source: '歼-16战机',
            target: '巡逻任务',
            label: {
              show: true,
              formatter: '执行'
            },
          },
        ],
        lineStyle: {
          opacity: 0.9,
          width: 3,
          // curveness: 0.5
        }
      }
    ]
  };

  myChart.setOption(option, true);

}

</script>

<style scoped>
.content {
  padding: 5px 10px 10px 10px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.input-section {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  margin-bottom: 24px;
}

.input-methods {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.text-input,
.file-upload {
  flex: 1;
}

h2 {
  margin-bottom: 20px;
  color: #1890ff;
  font-weight: bold;
}

h3 {
  margin-bottom: 12px;
  color: #333;
}

.upload-hint {
  margin-top: 8px;
  color: #999;
  font-size: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  justify-content: center;
  padding-top: 16px;
}

.extraction-process {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
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
}

.visualization-container {
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px dashed #e8e8e8;
}

.visualization-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin-top: 16px;
  background-color: #fafafa;
}

.original-text,
.tokenization-result,
.entity-recognition,
.keyword-extraction,
.final-result {
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.text-content {
  white-space: pre-wrap;
  line-height: 1.8;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border-left: 4px solid #1890ff;
}

.tokens-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.token {
  display: inline-block;
  padding: 4px 8px;
  /* background-color: #e6f7ff; */
  /* border: 1px solid #91d5ff; */
  /* border-radius: 4px; */
  font-size: 14px;
  /* font-weight: bold; */
}

.entity-category {
  margin-bottom: 12px;
}

.category-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.ant-tag {
  font-size: 16px;
}

.entity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keywords-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
  justify-content: center;
}

.keyword-tag {
  margin: 4px;
  padding: 4px 8px;
  transition: transform 0.3s;
}

.keyword-tag:hover {
  transform: scale(1.1);
}

.result-card {
  width: 100%;
}

.intel-tags {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tag-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-title {
  font-weight: bold;
  margin-right: 8px;
  min-width: 90px;
}

.text-content {
  white-space: pre-wrap;
  /* 保留换行 */
  line-height: 1.8;
  /* 设置行间距 */
  padding: 12px;
  background-color: #f9f9f9;
  /* 背景颜色 */
  border-radius: 4px;
  border-left: 4px solid #1890ff;
  /* 左侧边框颜色 */
  font-family: 'Courier New', Courier, monospace;
  /* 使用等宽字体 */
}

.token {
  display: inline-block;
  margin-right: 4px;
  /* 每个 token 之间的间距 */
  font-size: 14px;
  /* 字体大小 */
  transition: transform 0.3s;
  /* 添加交互效果 */
}

.token:hover {
  transform: scale(1.1);
  /* 鼠标悬停时放大 */
}
</style>