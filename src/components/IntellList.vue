<!-- 情报监控页面 -->
<template>
  <div class="dashboard-container">
    <a-card class="filter-card">
      <a-form layout="inline">
        <a-form-item label="状态">
          <a-select v-model:value="filterStatus" style="width: 150px" placeholder="选择状态" allowClear>
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="pending_extract">待推荐</a-select-option>
            <a-select-option value="pending_push">待推送</a-select-option>
            <a-select-option value="pushed">已推送</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="卫星编号">
          <a-input v-model:value="filterSatellite" placeholder="卫星编号" allowClear />
        </a-form-item>
        <a-form-item label="时间范围">
          <a-range-picker v-model:value="dateRange" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetFilters">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card class="table-card">
      <a-table :columns="columns" :data-source="intelligenceData" :rowKey="(record: Intelligence) => record.id"
        :pagination="pagination" :loading="loading" @change="handleTableChange">
        <!-- 定制表格列 -->
        <template #bodyCell="{ column, record }: { column: any, record: Intelligence }">
          <!-- 坐标列 -->
          <template v-if="column.key === 'coordinates'">
            <span>{{ record.latitude }}°, {{ record.longitude }}°</span>
          </template>

          <!-- 图像列 -->
          <template v-if="column.key === 'image'">
            <a-image :width="60" :src="record.imageUrl" />
          </template>

          <!-- 状态列 -->
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <div class="action-buttons">
              <a-button type="link" size="small" @click="viewPushedUsers(record.id)"
                :disabled="record.status !== 'pushed'">
                查看已推送用户
              </a-button>
              <a-button type="link" size="small" @click="viewIntelligenceProfile(record.id)">
                查看情报画像
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 查看已推送用户的模态框 -->
    <a-modal v-model:open="pushModalVisible" title="已推送用户（推送时间:2021-01-01 13:00:12）" width="600px" :footer="null">
      <a-list item-layout="horizontal" :data-source="pushedUsers">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-tag :color="item.readStatus ? 'green' : 'orange'">
              {{ item.readStatus ? '已读' : '未读' }}
            </a-tag>
            <a-list-item-meta>
              <template #title>
                <a>{{ item.name }}</a>
              </template>
            </a-list-item-meta>

            <div>
              <a-tag v-for="alg in item.algorithm" :key="alg" :color="algorithmTagMap[alg]?.color || 'default'">
                {{ algorithmTagMap[alg]?.label || alg }}
              </a-tag>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </a-modal>

    <!-- 查看情报画像的模态框 -->
    <a-modal v-model:open="profileModalVisible" title="情报画像" width="800px" :footer="null">
      <div v-if="currentIntelligence" class="intel-profile">
        <div class="profile-header">
          <h2>情报ID: {{ currentIntelligence.id }}</h2>
          <a-tag :color="getStatusColor(currentIntelligence.status)">
            {{ getStatusText(currentIntelligence.status) }}
          </a-tag>
        </div>

        <a-descriptions bordered>
          <a-descriptions-item label="位置" span="1">
            {{ currentIntelligence.latitude }}°, {{ currentIntelligence.longitude }}°
          </a-descriptions-item>
          <a-descriptions-item label="卫星编号">
            {{ currentIntelligence.satelliteId }}
          </a-descriptions-item>
          <a-descriptions-item label="发生时间">
            {{ currentIntelligence.eventTime }}
          </a-descriptions-item>
          <a-descriptions-item label="接收时间">
            {{ currentIntelligence.receiveTime }}
          </a-descriptions-item>
          <a-descriptions-item label="情报内容" span="3">
            {{ currentIntelligence.content }}
          </a-descriptions-item>
        </a-descriptions>

        <div class="profile-image">
          <h3>遥感图像</h3>
          <a-image :width="400" :src="currentIntelligence.imageUrl" />
        </div>

        <RelationGraph :graphData="graphData" height="300px" />

        <a-divider orientation="left">关联情报</a-divider>
        <a-list size="small" bordered :data-source="relatedIntelligence">
          <template #renderItem="{ item }">
            <a-list-item>
              <a @click="viewIntelligenceProfile(item.id)">
                {{ item.id }} - {{ item.content.substring(0, 30) }}...
              </a>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import demoImg from '@/assets/images/demo.jpeg';
import RelationGraph from '@/components/RelationGraph.vue'
import type { TablePaginationConfig } from 'ant-design-vue';

// 类型声明
interface PushedUser {
  id: number;
  name: string;
  pushTime: string;
  readStatus: boolean;
  algorithm: string[];
}

interface Intelligence {
  id: string;
  latitude: string;
  longitude: string;
  satelliteId: string;
  imageUrl: string;
  content: string;
  eventTime: string;
  receiveTime: string;
  pushTime: string;
  status: string;
}

interface RelatedIntel {
  id: string;
  content: string;
}

const graphData = ref({
  nodes: [
    { name: '歼-16战机', x: 100, y: 100 },
    { name: '情报10331号', x: 300, y: 300 },
    { name: '2023年10月15日14时30分', x: 500, y: 100 },
    { name: '东海', x: 500, y: 500 },
    { name: '巡逻任务', x: 100, y: 500 }
  ],
  links: [
    { source: '情报10331号', target: '歼-16战机', label: { show: true, formatter: '目标舰机型' } },
    { source: '情报10331号', target: '2023年10月15日14时30分', label: { show: true, formatter: '时间' } },
    { source: '情报10331号', target: '巡逻任务', label: { show: true, formatter: '任务类型' } },
    { source: '情报10331号', target: '东海', label: { show: true, formatter: '地区' } },
    { source: '巡逻任务', target: '东海', label: { show: true, formatter: '执行于' } },
    { source: '歼-16战机', target: '巡逻任务', label: { show: true, formatter: '执行' } },
  ]
});



// 表格数据
const loading = ref(false);
const filterStatus = ref('');
const filterSatellite = ref('');
const dateRange = ref([]);

// 表格分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
});

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    sorter: true,
    width: 80,
  },
  {
    title: '经纬度',
    key: 'coordinates',
    width: 140,
  },
  {
    title: '卫星编号',
    dataIndex: 'satelliteId',
    key: 'satelliteId',
    width: 100,
  },
  {
    title: '遥感图像',
    key: 'image',
    width: 100,
  },
  {
    title: '情报内容',
    dataIndex: 'content',
    key: 'content',
    ellipsis: true,
    width: 220,
  },
  {
    title: '发生时间',
    dataIndex: 'eventTime',
    key: 'eventTime',
    sorter: true,
    width: 160,
  },
  {
    title: '接收时间',
    dataIndex: 'receiveTime',
    key: 'receiveTime',
    sorter: true,
    width: 160,
  },
  {
    title: '推送时间',
    dataIndex: 'pushTime',
    key: 'pushTime',
    sorter: true,
    width: 160,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    filters: [
      { text: '待推荐', value: 'pending_process' },
      { text: '待推送', value: 'pending_push' },
      { text: '已推送', value: 'pushed' },
    ],
    width: 100,
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 200,
  },
];

// 模拟数据
const generateMockData = () => {
  const data = [];
  const statuses = ['pending_process', 'pending_push', 'pushed'];
  const satellites = ['SAT-001', 'SAT-002', 'SAT-003', 'SAT-004', 'SAT-005'];

  for (let i = 1; i <= 50; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const now = new Date();
    const eventTime = new Date(now.getTime() - Math.random() * 86400000 * 7);
    const receiveTime = new Date(eventTime.getTime() + Math.random() * 3600000);
    let pushTime = null;

    if (status === 'pushed') {
      pushTime = new Date(receiveTime.getTime() + Math.random() * 3600000);
    }

    data.push({
      id: `INT-${10000 + i}`,
      latitude: (20 + Math.random() * 25).toFixed(6),
      longitude: (100 + Math.random() * 30).toFixed(6),
      satelliteId: satellites[Math.floor(Math.random() * satellites.length)],
      imageUrl: demoImg,
      content: `在区域${i}发现异常活动，疑似有${Math.floor(Math.random() * 10) + 1}个不明目标在进行可疑操作。建议加强监控并派出侦察队伍进行调查。`,
      eventTime: dayjs(eventTime).format('YYYY-MM-DD HH:mm:ss'),
      receiveTime: dayjs(receiveTime).format('YYYY-MM-DD HH:mm:ss'),
      pushTime: pushTime ? dayjs(pushTime).format('YYYY-MM-DD HH:mm:ss') : '-',
      status,
    });
  }

  return data;
};

const intelligenceData = ref<Intelligence[]>([]);

// 获取状态颜色
const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    pending_extract: 'orange',
    pending_relate: 'blue',
    pending_push: 'purple',
    pushed: 'green',
  };
  return statusMap[status] || 'default';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending_process: '待处理',
    pending_push: '待推送',
    pushed: '已推送',
  };
  return statusMap[status] || '未知';
};

// 模态框数据
const pushModalVisible = ref(false);
const profileModalVisible = ref(false);
const pushedUsers = ref<PushedUser[]>([]);
const currentIntelligence = ref<Intelligence | null>(null);
const relatedIntelligence = ref<RelatedIntel[]>([]);

// 查看已推送用户
const viewPushedUsers = (id: string) => {
  loading.value = true;

  // 模拟API请求
  setTimeout(() => {
    // 生成模拟数据
    pushedUsers.value = Array(Math.floor(Math.random() * 5) + 3).fill(0).map((_, index) => ({
      id: index + 1,
      name: `用户${index + 1}`,
      pushTime: dayjs().subtract(Math.floor(Math.random() * 5), 'hour').format('YYYY-MM-DD HH:mm:ss'),
      readStatus: Math.random() > 0.5,
      algorithm: getRandomAlgorithms()
    }));

    loading.value = false;
    pushModalVisible.value = true;
  }, 500);
};

// 查看情报画像
const viewIntelligenceProfile = (id: string) => {
  loading.value = true;
  // 模拟API请求
  setTimeout(() => {
    // 查找当前情报
    const intelligence = intelligenceData.value.find(item => item.id === id);
    if (intelligence) {
      currentIntelligence.value = intelligence;
      // 生成模拟关联情报数据
      relatedIntelligence.value = Array(Math.floor(Math.random() * 2) + 1).fill(0).map((_, index) => {
        const relatedId = intelligenceData.value[Math.floor(Math.random() * intelligenceData.value.length)].id;
        return intelligenceData.value.find(item => item.id === relatedId) || {
          id: `INT-${Math.floor(Math.random() * 1000) + 10000}`,
          content: `相关情报${index + 1}，包含与当前情报相似的目标活动`,
        };
      });
      loading.value = false;
      profileModalVisible.value = true;
    } else {
      message.error('未找到相关情报信息');
      loading.value = false;
    }
  }, 500);
};

// 表格变化处理
const handleTableChange = (pag: TablePaginationConfig) => {
  loading.value = true;
  pagination.current = pag.current ?? 1;
  pagination.pageSize = pag.pageSize ?? 10;
  // 模拟API请求
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

// 搜索处理
const handleSearch = () => {
  pagination.current = 1;
  loading.value = true;

  // 模拟API请求
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

// 重置过滤器
const resetFilters = () => {
  filterStatus.value = '';
  filterSatellite.value = '';
  dateRange.value = [];
  handleSearch();
};

// 组件挂载时加载数据
onMounted(() => {
  loading.value = true;

  // 模拟API请求获取数据
  setTimeout(() => {
    intelligenceData.value = generateMockData();
    pagination.total = intelligenceData.value.length;
    loading.value = false;
  }, 1000);
});

const algorithmTagMap: Record<string, { label: string; color: string }> = {
  situation: { label: '态势推荐', color: 'blue' },
  comprehensive: { label: '综合推荐', color: 'purple' },
  similarity: { label: '相似度推荐', color: 'green' },
  vector: { label: '向量化推荐', color: 'geekblue' },
};

function getRandomAlgorithms() {
  const count = Math.floor(Math.random() * 2) + 1; // 1或2个
  const shuffled = Object.keys(algorithmTagMap).sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
</script>

<style lang="less" scoped>
.dashboard-container {
  padding: 24px;
  min-height: calc(100vh - 64px);
  background-color: transparent;
  .filter-card,
  .table-card {
    margin-bottom: 24px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .stat-footer {
    display: flex;
    justify-content: space-between;

    .trend-up {
      color: #52c41a;
    }

    .trend-down {
      color: #f5222d;
    }
  }

  .filter-card {
    :deep(.ant-form-item) {
      margin-bottom: 16px;
    }
  }

  .action-buttons {
    button {
      padding: 0 8px;
    }
  }
}

.intel-profile {
  .profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
    }
  }

  .profile-image {
    margin: 20px 0;
    text-align: center;
  }
}

/* 标签容器样式 */
.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  width: 100%;
  margin-top: 8px;
  margin-left: 0;
  padding-left: 0;
}
</style>
