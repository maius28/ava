<!-- 情报抽取界面 -->
<template>
  <!-- 文字描述区域，算法的描述文字 -->
  <div class="product-description">
    <a-card title="算法名称" style="margin: 10px 10px 10px 10px;">
      <p>使用先进的自然语言处理技术，从海量文本中提取有价值的情报数据。</p>
    </a-card>

  </div>

  <!-- 功能展示区域，展示当前页面的主要功能 -->
  <div class="content">
    <div class="input-section">
      <h2>情报信息输入</h2>
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
          开始抽取
        </a-button>
      </div>
    </div>

    <!-- 抽取进度与结果 -->
    <div class="extraction-process" v-if="isProcessStarted">
      <h2>抽取进度(或者是算法的function call)</h2>

      <!-- 步骤条 -->
      <a-steps :current="currentStep" class="extraction-steps">
        <a-step title="文本预处理" description="清洗文本并进行分词" />
        <a-step title="实体识别" description="识别人物、地点、组织等实体" />
        <a-step title="关键词提取" description="抽取文本中的关键词" />
        <a-step title="语义分析" description="分析情报语义和主题" />
        <a-step title="可视化展示" description="生成结果报告" />
      </a-steps>

      <!-- 进度条 -->
      <div class="progress-container">
        <a-progress :percent="progressPercent" :status="progressStatus" />
        <div class="progress-info">{{ progressInfo }}</div>
      </div>

      <!-- 抽取过程可视化 -->
      <div class="visualization-container">
        <h2>抽取过程与结果</h2>

        <div class="visualization-area" ref="visualizationArea">
          <!-- 原始文本 -->
          <div class="original-text" v-if="currentStep >= 0">
            <h3>原始情报文本</h3>
            <div class="text-content">
              <p v-for="(paragraph, index) in textParagraphs" :key="index" class="paragraph">
                {{ paragraph }}
              </p>
            </div>
          </div>

          <!-- 分词结果 -->
          <div class="tokenization-result" v-if="currentStep >= 1">
            <h3>分词结果</h3>
            <div class="tokens-container">
              <span v-for="(token, index) in tokens" :key="index" class="token">{{ token }}</span>
            </div>
          </div>

          <!-- 实体识别 -->
          <div class="entity-recognition" v-if="currentStep >= 2">
            <h3>实体识别结果</h3>
            <div class="entities-container">
              <div v-for="(category, catIndex) in entityCategories" :key="catIndex" class="entity-category">
                <div class="category-title">{{ category.name }}：</div>
                <div class="entity-tags">
                  <a-tag v-for="(entity, entIndex) in category.entities" :key="entIndex" :color="category.color">
                    {{ entity }}
                  </a-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- 关键词提取 -->
          <div class="keyword-extraction" v-if="currentStep >= 3">
            <h3>关键词提取结果</h3>
            <div class="keywords-cloud">
              <a-tag v-for="(keyword, index) in keywords" :key="index" :color="getKeywordColor(keyword.weight)"
                :style="{ fontSize: getKeywordSize(keyword.weight) }" class="keyword-tag">
                {{ keyword.word }} ({{ keyword.weight.toFixed(2) }})
              </a-tag>
            </div>
          </div>

          <!-- 最终结果 -->
          <div class="final-result" v-if="currentStep >= 4">
            <h3>情报分析结果</h3>
            <a-card class="result-card">
              <template #title>情报摘要</template>
              <p>{{ summary }}</p>

              <a-divider />

              <div class="intel-tags">
                <div class="tag-section">
                  <div class="tag-title">主题分类：</div>
                  <a-tag color="blue" v-for="(topic, index) in topics" :key="`topic-${index}`">{{ topic }}</a-tag>
                </div>

                <div class="tag-section">
                  <div class="tag-title">情感倾向：</div>
                  <a-tag :color="sentimentColor">{{ sentiment }}</a-tag>
                </div>

                <div class="tag-section">
                  <div class="tag-title">时间信息：</div>
                  <a-tag color="purple" v-for="(time, index) in timeInfo" :key="`time-${index}`">{{ time }}</a-tag>
                </div>

                <div class="tag-section">
                  <div class="tag-title">建议关注用户：</div>
                  <a-tag color="orange" v-for="(user, index) in recommendedUsers" :key="`user-${index}`">{{ user
                    }}</a-tag>
                </div>
              </div>
            </a-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue';
import {
  UploadOutlined,
  FileTextOutlined,
  DeleteOutlined,
  ExperimentOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

// 输入数据
const intelText = ref('');
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
const keywords = ref([]);
const summary = ref('');
const topics = ref([]);
const sentiment = ref('');
const sentimentColor = ref('');
const timeInfo = ref([]);
const recommendedUsers = ref([]);

// 计算属性
const canExtract = computed(() => {
  return intelText.value.trim().length > 0 || fileList.value.length > 0;
});

const textParagraphs = computed(() => {
  return intelText.value.split('\n').filter(p => p.trim().length > 0);
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

// 开始抽取过程
const startExtraction = async () => {
  // 重置状态
  extracting.value = true;
  isProcessStarted.value = true;
  currentStep.value = -1;
  progressPercent.value = 0;
  progressInfo.value = '正在准备...';

  // 模拟各个步骤的处理过程
  await simulateStep(0, '正在进行文本预处理...', 20);
  generateTokens();

  await simulateStep(1, '正在识别实体...', 40);
  generateEntities();

  await simulateStep(2, '正在提取关键词...', 60);
  generateKeywords();

  await simulateStep(3, '正在进行语义分析...', 80);
  generateSemanticAnalysis();

  await simulateStep(4, '正在生成结果报告...', 100);
  generateFinalResults();

  // 完成处理
  progressInfo.value = '抽取完成';
  extracting.value = false;

  // 滚动到结果区域
  await nextTick();
  document.querySelector('.visualization-container')?.scrollIntoView({ behavior: 'smooth' });
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
      name: '地点',
      color: 'blue',
      entities: ['北京', '南海', '上海', '广州', '西藏']
    },
    {
      name: '组织',
      color: 'purple',
      entities: ['军方', '国防部', '外交部', '研究所']
    },
    {
      name: '人物',
      color: 'green',
      entities: ['指挥官', '专家', '分析师', '决策者']
    },
    {
      name: '时间',
      color: 'orange',
      entities: ['今日', '本月', '近期', '2023年']
    }
  ];
};

// 生成关键词提取结果
const generateKeywords = () => {
  // 模拟关键词及其权重
  keywords.value = [
    { word: '南海', weight: 0.95 },
    { word: '军事', weight: 0.89 },
    { word: '演习', weight: 0.82 },
    { word: '舰船', weight: 0.76 },
    { word: '监控', weight: 0.71 },
    { word: '卫星', weight: 0.68 },
    { word: '防御', weight: 0.65 },
    { word: '部署', weight: 0.62 },
    { word: '指挥', weight: 0.58 },
    { word: '战略', weight: 0.54 },
    { word: '情报', weight: 0.50 },
    { word: '分析', weight: 0.47 },
    { word: '技术', weight: 0.44 },
    { word: '地区', weight: 0.40 },
    { word: '安全', weight: 0.37 }
  ];
};

// 生成语义分析结果
const generateSemanticAnalysis = () => {
  // 模拟语义分析结果
  summary.value = '情报内容主要涉及南海地区的军事活动，包括多艘舰船聚集和演习准备。卫星监控显示有异常动向，建议加强情报搜集和分析。';
  topics.value = ['军事活动', '区域安全', '海洋监控'];
  sentiment.value = '中性偏紧张';
  sentimentColor.value = 'orange';
};

// 生成最终结果
const generateFinalResults = () => {
  // 时间信息
  timeInfo.value = ['2023年4月15日', '近期持续活动'];

  // 推荐关注用户
  recommendedUsers.value = ['军事情报部', '南海研究所', '战略评估中心', '外交安全司'];
};

// 获取关键词颜色
const getKeywordColor = (weight) => {
  const colors = ['cyan', 'blue', 'geekblue', 'purple', 'magenta'];
  const index = Math.floor(weight * colors.length);
  return colors[Math.min(index, colors.length - 1)];
};

// 获取关键词大小
const getKeywordSize = (weight) => {
  // 权重映射到12px-24px之间
  const size = 12 + weight * 12;
  return `${size}px`;
};
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
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  font-size: 14px;
}

.entity-category {
  margin-bottom: 12px;
}

.category-title {
  font-weight: bold;
  margin-bottom: 8px;
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
</style>
