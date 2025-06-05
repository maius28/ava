<template>
  <div class="recommend-container">
    <a-tabs v-model:activeKey="activeTabKey">
      <a-tab-pane key="intel" tab="情报推荐视图">
        <!-- 情报侧视图 -->
        <div class="intel-view">
          <!-- 算法描述部分 -->
          <a-card class="algorithm-card" title="情报推荐算法说明">
            <div class="algorithm-description">
              <p>本系统采用基于内容和协同过滤的混合推荐算法，结合情报特征和用户画像，为情报内容寻找最匹配的目标用户。</p>

              <a-divider orientation="left">算法核心流程</a-divider>
              <a-steps direction="vertical" size="small" :current="4" class="algo-steps">
                <a-step title="情报特征提取" description="使用NLP技术从情报文本中提取关键词、实体和主题" />
                <a-step title="用户画像构建" description="基于用户历史交互和标签信息，构建兴趣模型" />
                <a-step title="向量空间匹配" description="将情报和用户投影到同一向量空间，计算相似度" />
                <a-step title="多因素融合排序" description="综合考虑内容相关性、时效性和用户活跃度" />
                <a-step title="个性化推送" description="将最终排序结果推送给相关用户" />
              </a-steps>

              <a-divider orientation="left">核心技术优势</a-divider>
              <div class="tech-advantages">
                <a-tag color="blue">精准匹配</a-tag>
                <a-tag color="green">实时响应</a-tag>
                <a-tag color="purple">冷启动解决方案</a-tag>
                <a-tag color="orange">多维度评估</a-tag>
                <a-tag color="cyan">可解释推荐结果</a-tag>
              </div>
            </div>
          </a-card>

          <!-- 情报推荐演示部分 -->
          <a-card class="intel-demo-card" title="情报推荐演示">
            <a-form layout="vertical">
              <a-form-item label="情报内容">
                <a-textarea v-model:value="intelContent" placeholder="请输入或选择情报内容..." :rows="4" allow-clear />
              </a-form-item>

              <a-form-item label="快速选择示例情报">
                <a-radio-group v-model:value="selectedIntelExample" @change="handleExampleChange">
                  <a-radio-button value="1">南海军事活动</a-radio-button>
                  <a-radio-button value="2">边境异常情况</a-radio-button>
                  <a-radio-button value="3">技术情报收集</a-radio-button>
                </a-radio-group>
              </a-form-item>

              <a-form-item>
                <a-button type="primary" @click="processIntel" :loading="processing" :disabled="!intelContent">
                  分析并推荐
                </a-button>
              </a-form-item>
            </a-form>

            <!-- 推荐结果展示 -->
            <div v-if="showResults" class="recommendation-results">
              <a-divider>推荐流程与结果</a-divider>

              <!-- 情报处理流程 -->
              <div class="processing-flow">
                <h3>情报处理流程</h3>
                <a-steps :current="currentStep" size="small">
                  <a-step title="关键词提取" />
                  <a-step title="主题识别" />
                  <a-step title="用户匹配" />
                  <a-step title="结果生成" />
                </a-steps>

                <!-- 关键词提取结果 -->
                <div class="keywords-result" v-if="currentStep >= 0">
                  <h4>关键词提取结果</h4>
                  <div class="keywords-tags">
                    <a-tag v-for="(keyword, index) in extractedKeywords" :key="index" color="blue">
                      {{ keyword.word }} ({{ keyword.weight }})
                    </a-tag>
                  </div>
                </div>

                <!-- 主题识别结果 -->
                <div class="topics-result" v-if="currentStep >= 1">
                  <h4>主题识别结果</h4>
                  <div class="topics-list">
                    <a-tag v-for="(topic, index) in identifiedTopics" :key="index" color="purple">
                      {{ topic.name }} ({{ topic.confidence }}%)
                    </a-tag>
                  </div>
                </div>

                <!-- 用户匹配过程 -->
                <div class="user-matching" v-if="currentStep >= 2">
                  <h4>用户匹配过程</h4>
                  <div class="matching-visualization">
                    <div class="intel-node">
                      <div class="node-icon"><file-text-outlined /></div>
                      <div class="node-label">情报内容</div>
                    </div>

                    <div class="connection-lines">
                      <div v-for="(user, index) in recommendedUsers" :key="index" class="connection-line"
                        :style="{ width: `${user.score * 100}%` }"></div>
                    </div>

                    <div class="user-nodes">
                      <div v-for="(user, index) in recommendedUsers" :key="index" class="user-node">
                        <a-avatar :style="{ backgroundColor: user.color }">{{ user.name.charAt(0) }}</a-avatar>
                        <div class="user-score">{{ user.score.toFixed(2) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 推荐用户结果 -->
              <div class="recommended-users" v-if="currentStep >= 3">
                <h3>推荐用户结果</h3>
                <a-list :data-source="recommendedUsers" class="user-list">
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <a-list-item-meta>
                        <template #avatar>
                          <a-avatar :style="{ backgroundColor: item.color }">{{ item.name.charAt(0) }}</a-avatar>
                        </template>
                        <template #title>{{ item.name }}</template>
                        <template #description>
                          <div>匹配度: {{ (item.score * 100).toFixed(1) }}%</div>
                          <div class="user-tags">
                            <a-tag v-for="(tag, tagIndex) in item.tags" :key="tagIndex" color="blue">
                              {{ tag }}
                            </a-tag>
                          </div>
                        </template>
                      </a-list-item-meta>
                      <template #extra>
                        <a-button type="primary" size="small">推送</a-button>
                      </template>
                    </a-list-item>
                  </template>
                </a-list>
              </div>
            </div>
          </a-card>
        </div>
      </a-tab-pane>

      <a-tab-pane key="user" tab="用户情报查询">
        <!-- 用户侧视图 -->
        <div class="user-view">
          <a-card title="情报查询">
            <div class="search-section">
              <a-input-search v-model:value="searchQuery" placeholder="输入关键词查询相关情报..." enter-button="搜索" size="large"
                @search="handleSearch" :loading="searching" />

              <div class="search-tags">
                <span class="tag-label">热门标签：</span>
                <a-tag v-for="tag in hotTags" :key="tag" color="blue" class="clickable-tag" @click="quickSearch(tag)">
                  {{ tag }}
                </a-tag>
              </div>
            </div>

            <!-- 搜索结果 -->
            <div class="search-results" v-if="searchResults.length > 0">
              <a-divider>搜索结果 ({{ searchResults.length }})</a-divider>

              <a-list class="intel-list" item-layout="vertical" size="large" :data-source="searchResults">
                <template #renderItem="{ item }">
                  <a-list-item key="item.id">
                    <template #extra>
                      <img :src="item.image" alt="情报图片" class="intel-image" @click="() => previewImage(item.image)" />
                    </template>
                    <a-list-item-meta :title="item.title">
                      <template #description>
                        <span class="intel-time">{{ item.time }}</span>
                        <a-tag v-if="item.level === 'high'" color="red">高重要度</a-tag>
                        <a-tag v-else-if="item.level === 'medium'" color="orange">中重要度</a-tag>
                        <a-tag v-else color="blue">一般重要度</a-tag>
                      </template>
                    </a-list-item-meta>
                    <div class="intel-content">{{ item.content }}</div>
                    <div class="intel-tags">
                      <a-tag v-for="(tag, tagIndex) in item.tags" :key="tagIndex" color="blue" class="clickable-tag"
                        @click="quickSearch(tag)">
                        {{ tag }}
                      </a-tag>
                    </div>
                  </a-list-item>
                </template>
              </a-list>
            </div>

            <div v-else-if="searched" class="no-results">
              <a-empty description="没有找到相关情报" />
            </div>
          </a-card>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 图片预览 -->
    <a-image :width="0" :height="0" :visible="previewVisible" :src="previewImageSrc"
      @visibleChange="handlePreviewVisibleChange" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch } from 'vue';
import { FileTextOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

// 标签页控制
const activeTabKey = ref('intel');

// =========== 情报侧相关状态 ===========
// 情报输入
const intelContent = ref('');
const selectedIntelExample = ref('');

// 处理状态
const processing = ref(false);
const showResults = ref(false);
const currentStep = ref(-1);

// 示例情报数据
const intelExamples = {
  '1': '南海地区发现不明舰船集结，数量约为12艘，包括3艘大型军舰。卫星图像显示舰船呈战斗队形排列，疑似进行军事演习。建议加强监控并通知相关部门。',
  '2': '东北边境监测站报告，边境一侧出现异常活动，有大量车辆和人员集结。初步判断可能是例行军事演习，但时间与往年不符。建议密切关注事态发展。',
  '3': '某国在我国南部沿海设立多个信号接收站，疑似进行电子情报收集活动。技术分析表明，信号覆盖我国多个军事设施和科研机构。建议采取相应技术对抗措施。'
};

// 提取的关键词
const extractedKeywords = ref([]);
// 识别的主题
const identifiedTopics = ref([]);
// 推荐的用户
const recommendedUsers = ref([]);

// 示例关键词
const keywordsExamples = {
  '1': [
    { word: '南海', weight: 0.95 },
    { word: '舰船', weight: 0.88 },
    { word: '军舰', weight: 0.82 },
    { word: '集结', weight: 0.75 },
    { word: '演习', weight: 0.70 },
    { word: '监控', weight: 0.65 }
  ],
  '2': [
    { word: '边境', weight: 0.92 },
    { word: '东北', weight: 0.85 },
    { word: '异常', weight: 0.80 },
    { word: '集结', weight: 0.78 },
    { word: '演习', weight: 0.68 },
    { word: '车辆', weight: 0.62 }
  ],
  '3': [
    { word: '情报收集', weight: 0.94 },
    { word: '信号', weight: 0.87 },
    { word: '电子', weight: 0.83 },
    { word: '军事设施', weight: 0.79 },
    { word: '科研机构', weight: 0.76 },
    { word: '技术对抗', weight: 0.70 }
  ]
};

// 示例主题
const topicsExamples = {
  '1': [
    { name: '军事活动', confidence: 95 },
    { name: '海洋安全', confidence: 87 },
    { name: '国防监控', confidence: 78 }
  ],
  '2': [
    { name: '边境安全', confidence: 93 },
    { name: '军事演习', confidence: 85 },
    { name: '区域监控', confidence: 75 }
  ],
  '3': [
    { name: '信息安全', confidence: 96 },
    { name: '技术对抗', confidence: 88 },
    { name: '情报防护', confidence: 82 }
  ]
};

// 示例用户
const usersExamples = {
  '1': [
    { id: 1, name: '南海战略研究所', score: 0.95, color: '#1890ff', tags: ['海洋安全', '军事研究', '战略分析'] },
    { id: 2, name: '海军情报部', score: 0.89, color: '#722ed1', tags: ['海军', '军事情报', '舰船动态'] },
    { id: 3, name: '国防部战略局', score: 0.82, color: '#fa8c16', tags: ['国防', '战略规划', '态势感知'] },
    { id: 4, name: '外交安全处', score: 0.75, color: '#52c41a', tags: ['外交安全', '国际关系', '危机管理'] }
  ],
  '2': [
    { id: 5, name: '边境防卫部', score: 0.93, color: '#fa541c', tags: ['边境安全', '地区监控', '预警分析'] },
    { id: 6, name: '东北军区', score: 0.87, color: '#13c2c2', tags: ['军事部署', '区域防卫', '战备状态'] },
    { id: 2, name: '情报分析中心', score: 0.78, color: '#722ed1', tags: ['情报分析', '数据挖掘', '风险评估'] },
    { id: 3, name: '国防部战略局', score: 0.72, color: '#fa8c16', tags: ['国防', '战略规划', '态势感知'] }
  ],
  '3': [
    { id: 7, name: '电子对抗部门', score: 0.96, color: '#eb2f96', tags: ['信号分析', '电子战', '技术对抗'] },
    { id: 8, name: '科技安全办公室', score: 0.90, color: '#1890ff', tags: ['科技安全', '保密工作', '防护措施'] },
    { id: 2, name: '情报分析中心', score: 0.85, color: '#722ed1', tags: ['情报分析', '数据挖掘', '风险评估'] },
    { id: 9, name: '军事科学院', score: 0.80, color: '#52c41a', tags: ['军事科技', '科研安全', '技术研发'] }
  ]
};

// 处理示例情报选择
const handleExampleChange = () => {
  intelContent.value = intelExamples[selectedIntelExample.value];
};

// 处理情报分析和推荐
const processIntel = async () => {
  processing.value = true;
  showResults.value = true;
  currentStep.value = -1;

  // 重置结果
  extractedKeywords.value = [];
  identifiedTopics.value = [];
  recommendedUsers.value = [];

  // 模拟处理过程
  await simulateStep(0, () => {
    extractedKeywords.value = selectedIntelExample.value ?
      keywordsExamples[selectedIntelExample.value] :
      generateRandomKeywords();
  });

  await simulateStep(1, () => {
    identifiedTopics.value = selectedIntelExample.value ?
      topicsExamples[selectedIntelExample.value] :
      generateRandomTopics();
  });

  await simulateStep(2, () => {
    recommendedUsers.value = selectedIntelExample.value ?
      usersExamples[selectedIntelExample.value] :
      generateRandomUsers();
  });

  await simulateStep(3, () => {
    message.success('情报分析完成，已生成推荐结果');
  });

  processing.value = false;
};

// 模拟处理步骤
const simulateStep = async (step, callback) => {
  return new Promise(resolve => {
    setTimeout(() => {
      currentStep.value = step;
      callback();
      resolve(true);
    }, 1000);
  });
};

// 生成随机关键词
const generateRandomKeywords = () => {
  const allKeywords = [
    '军事', '演习', '舰船', '边境', '安全', '监控', '信号',
    '情报', '技术', '防御', '预警', '分析', '部署'
  ];

  const result = [];
  const count = 5 + Math.floor(Math.random() * 3);

  for (let i = 0; i < count; i++) {
    const word = allKeywords[Math.floor(Math.random() * allKeywords.length)];
    const weight = (0.95 - (i * 0.05)).toFixed(2);
    result.push({ word, weight });
  }

  return result;
};

// 生成随机主题
const generateRandomTopics = () => {
  const allTopics = [
    '军事活动', '海洋安全', '边境监控', '情报分析', '技术对抗',
    '区域安全', '防御部署', '战略评估', '预警系统'
  ];

  const result = [];
  const count = 2 + Math.floor(Math.random() * 2);

  for (let i = 0; i < count; i++) {
    const name = allTopics[Math.floor(Math.random() * allTopics.length)];
    const confidence = 95 - (i * 10);
    result.push({ name, confidence });
  }

  return result;
};

// 生成随机用户
const generateRandomUsers = () => {
  const allUsers = [
    { id: 1, name: '南海战略研究所', color: '#1890ff', tags: ['海洋安全', '军事研究', '战略分析'] },
    { id: 2, name: '情报分析中心', color: '#722ed1', tags: ['情报分析', '数据挖掘', '风险评估'] },
    { id: 3, name: '国防部战略局', color: '#fa8c16', tags: ['国防', '战略规划', '态势感知'] },
    { id: 4, name: '外交安全处', color: '#52c41a', tags: ['外交安全', '国际关系', '危机管理'] },
    { id: 5, name: '边境防卫部', color: '#fa541c', tags: ['边境安全', '地区监控', '预警分析'] },
    { id: 6, name: '东北军区', color: '#13c2c2', tags: ['军事部署', '区域防卫', '战备状态'] },
    { id: 7, name: '电子对抗部门', color: '#eb2f96', tags: ['信号分析', '电子战', '技术对抗'] },
    { id: 8, name: '科技安全办公室', color: '#1890ff', tags: ['科技安全', '保密工作', '防护措施'] },
    { id: 9, name: '军事科学院', color: '#52c41a', tags: ['军事科技', '科研安全', '技术研发'] }
  ];

  const result = [];
  const count = 3 + Math.floor(Math.random() * 2);
  const selectedIndexes = new Set();

  while (selectedIndexes.size < count) {
    selectedIndexes.add(Math.floor(Math.random() * allUsers.length));
  }

  Array.from(selectedIndexes).forEach((index, i) => {
    const user = { ...allUsers[index] };
    user.score = (0.95 - (i * 0.07));
    result.push(user);
  });

  return result;
};

// =========== 用户侧相关状态 ===========
// 搜索状态
const searchQuery = ref('');
const searching = ref(false);
const searched = ref(false);
const searchResults = ref([]);

// 热门标签
const hotTags = [
  '南海', '军事演习', '边境', '信号情报', '技术对抗', '预警系统'
];

// 图片预览
const previewVisible = ref(false);
const previewImageSrc = ref('');

// 模拟情报数据
const intelData = [
  {
    id: 1,
    title: '南海舰船异常活动情报',
    content: '南海地区发现不明舰船集结，数量约为12艘，包括3艘大型军舰。卫星图像显示舰船呈战斗队形排列，疑似进行军事演习。',
    time: '2023-04-15 14:30:22',
    level: 'high',
    tags: ['南海', '舰船', '军事演习'],
    image: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'
  },
  {
    id: 2,
    title: '东北边境异常活动报告',
    content: '东北边境监测站报告，边境一侧出现异常活动，有大量车辆和人员集结。初步判断可能是例行军事演习，但时间与往年不符。',
    time: '2023-04-16 09:45:10',
    level: 'medium',
    tags: ['东北', '边境', '异常活动'],
    image: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'
  },
  {
    id: 3,
    title: '电子情报收集活动预警',
    content: '某国在我国南部沿海设立多个信号接收站，疑似进行电子情报收集活动。技术分析表明，信号覆盖我国多个军事设施和科研机构。',
    time: '2023-04-18 08:15:55',
    level: 'high',
    tags: ['电子情报', '信号', '技术对抗'],
    image: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'
  },
  {
    id: 4,
    title: '雷达站异常活动监测',
    content: '东北边境附近多处雷达站开始异常活动，信号强度明显高于平时水平。技术部门正在分析信号特征，初步判断可能是对我方通信系统的定向侦测。',
    time: '2023-04-19 11:20:30',
    level: 'medium',
    tags: ['雷达', '信号', '边境'],
    image: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'
  },
  {
    id: 5,
    title: '科技企业遭遇信号干扰',
    content: '深圳地区多个关键科技企业出现不明信号干扰，初步判断可能是电子情报收集活动。建议相关企业加强通信安全措施，防止机密信息泄露。',
    time: '2023-04-20 16:05:48',
    level: 'low',
    tags: ['信号干扰', '科技安全', '情报收集'],
    image: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'
  }
];

// 搜索情报
const handleSearch = (value) => {
  if (!value.trim()) {
    message.warning('请输入搜索关键词');
    return;
  }

  searching.value = true;
  searched.value = true;

  // 模拟搜索延迟
  setTimeout(() => {
    const query = value.toLowerCase();
    searchResults.value = intelData.filter(intel =>
      intel.title.toLowerCase().includes(query) ||
      intel.content.toLowerCase().includes(query) ||
      intel.tags.some(tag => tag.toLowerCase().includes(query))
    );

    searching.value = false;
    message.info(`找到 ${searchResults.value.length} 条相关情报`);
  }, 500);
};

// 快速搜索标签
const quickSearch = (tag) => {
  searchQuery.value = tag;
  handleSearch(tag);
};

// 预览图片
const previewImage = (src) => {
  previewImageSrc.value = src;
  previewVisible.value = true;
};

// 处理预览可见性变化
const handlePreviewVisibleChange = (visible) => {
  previewVisible.value = visible;
};
</script>

<style scoped>
.recommend-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

/* 情报视图样式 */
.intel-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.algorithm-card,
.intel-demo-card {
  width: 100%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.algorithm-description {
  font-size: 14px;
  line-height: 1.6;
}

.algo-steps {
  margin: 16px 0;
  max-width: 600px;
}

.tech-advantages {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.recommendation-results {
  margin-top: 24px;
}

.processing-flow {
  margin: 24px 0;
}

.processing-flow h3,
.recommended-users h3 {
  margin-bottom: 16px;
  color: #1890ff;
}

.processing-flow h4 {
  margin: 16px 0 8px;
  color: #333;
}

.keywords-tags,
.topics-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.matching-visualization {
  display: flex;
  align-items: center;
  margin: 24px 0;
  min-height: 100px;
}

.intel-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
}

.node-icon {
  width: 40px;
  height: 40px;
  background-color: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.node-label {
  margin-top: 8px;
  font-size: 12px;
  text-align: center;
}

.connection-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.connection-line {
  height: 2px;
  background: linear-gradient(to right, #1890ff, #52c41a);
  transition: width 1s ease-in-out;
}

.user-nodes {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 80px;
}

.user-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.user-score {
  font-size: 12px;
  color: #666;
}

.user-list {
  margin-top: 16px;
}

.user-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 用户视图样式 */
.search-section {
  margin-bottom: 24px;
}

.search-tags {
  margin-top: 16px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.tag-label {
  margin-right: 8px;
  color: #666;
}

.clickable-tag {
  cursor: pointer;
  transition: transform 0.2s;
}

.clickable-tag:hover {
  transform: scale(1.05);
}

.search-results {
  margin-top: 16px;
}

.intel-list {
  margin-top: 16px;
}

.intel-image {
  width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s;
}

.intel-image:hover {
  transform: scale(1.05);
}

.intel-time {
  color: #999;
  margin-right: 8px;
}

.intel-content {
  margin: 16px 0;
  color: #333;
  line-height: 1.6;
}

.intel-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.no-results {
  margin-top: 48px;
  text-align: center;
}
</style>