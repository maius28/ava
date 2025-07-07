<template>
  <div>
    <div class="stats-row">
      <div class="stat-card clickable" :class="{ active: filterStatus === '' }" @click="setFilter('')">
        <div class="stat-label">全部</div>
        <div class="stat-value">{{ totalCount }}</div>
      </div>
      <div class="stat-card clickable" :class="{ active: filterStatus === '未读' }" @click="setFilter('未读')">
        <div class="stat-label"><mail-filled style="color:#ff4d4f; font-size:18px; margin-right:4px;" />未读</div>
        <div class="stat-value">{{ unconfirmedCount }}</div>
      </div>
      <div class="stat-card clickable" :class="{ active: filterStatus === '已读' }" @click="setFilter('已读')">
        <div class="stat-label"> <mail-filled style="color:#52c41a; font-size:18px; margin-right:4px;" />已读</div>
        <div class="stat-value">{{ confirmedCount }}</div>
      </div>
      <div class="stat-card clickable" :class="{ active: filterStatus === '不感兴趣' }" @click="setFilter('不感兴趣')">
        <div class="stat-label"><delete-outlined style="color:gray; font-size:18px; margin-right:4px;" />不感兴趣</div>
        <div class="stat-value">{{ uninterestedCount }}</div>
      </div>
    </div>
    <a-table :columns="columns" :data-source="filteredData" row-key="id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <span class="icon-status">
            <template v-if="record.status === '未读'">
              <mail-filled style="color:#ff4d4f; font-size:18px; margin-right:4px;" />
            </template>
            <template v-else-if="record.status === '已读'">
              <mail-filled style="color:#52c41a; font-size:18px; margin-right:4px;" />
            </template>
            <template v-else>
              <delete-outlined style="color:gray; font-size:18px; margin-right:4px;" />
            </template>
            <span>{{ record.status }}</span>
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'id'">
          {{ record.id }}
        </template>
        <template v-else-if="column.dataIndex === 'image'">
          <img :src="record.image" alt="遥感图像"
            style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px;" />
        </template>
        <template v-else-if="column.dataIndex === 'actions'">
          <a @click="viewDetail(record)">查看详情</a>
          <a-divider type="vertical" />
          <template v-if="record.status === '不感兴趣'">
            <a @click="recoverRecommend(record)">恢复推荐</a>
          </template>
          <template v-else>
            <a @click="markUninterested(record)">不感兴趣</a>
          </template>
        </template>
        <template v-else>
          {{ record[column.dataIndex] }}
        </template>
      </template>
    </a-table>

    <!-- 查看情报画像的模态框 -->
    <a-modal v-model:open="profileModalVisible" title="情报画像" width="800px" :footer="null">
      <div v-if="currentIntelligence" class="intel-profile">
        <div class="profile-header">
          <h2 style="margin: 0;">情报ID: {{ currentIntelligence.id }}</h2>
          <a-button type="primary" danger @click="markUninterested(currentIntelligence)"
            v-if="currentIntelligence.status !== '不感兴趣'">
            不感兴趣, 减少推送
          </a-button>
          <a-tag v-if="currentIntelligence.status === '不感兴趣'" color="gray" style="font-size: 18px; padding: 8px 20px;">
            已标记为不感兴趣，减少推送
          </a-tag>
        </div>

        <a-descriptions bordered>
          <a-descriptions-item label="位置" span="1">
            123°, 111°
          </a-descriptions-item>
          <a-descriptions-item label="卫星编号">
            12323
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
          <a-image :width="400" :src="currentIntelligence.image" />
        </div>

        <RelationGraph :graphData="graphData" height="300px" />

      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MailFilled, DeleteOutlined } from '@ant-design/icons-vue';
import demoImg from '@/assets/images/demo.jpeg';
import { message } from 'ant-design-vue';
import RelationGraph from '@/components/RelationGraph.vue';

interface UserIntel {
  id: number;
  image: string;
  content: string;
  eventTime: string;
  receiveTime: string;
  status: string; // '已读' | '未读' | '不感兴趣';
  forwardTime: string;

}

const columns = [
  { title: 'Id', dataIndex: 'id', key: 'id', width: 60 },
  { title: '遥感图像', dataIndex: 'image', key: 'image' },
  { title: '文本内容', dataIndex: 'content', key: 'content' },
  { title: '发生时间', dataIndex: 'eventTime', key: 'eventTime' },
  { title: '接收时间', dataIndex: 'receiveTime', key: 'receiveTime' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', dataIndex: 'actions', key: 'actions' },

];

const data = ref<UserIntel[]>([
  {
    id: 1,
    image: demoImg,
    content: '疑似目标出现',
    eventTime: '2024-06-01 12:00',
    receiveTime: '2024-06-01 12:05',
    forwardTime: '2024-06-01 12:10',
    status: '未读',
  },
  {
    id: 2,
    image: demoImg,
    content: '发现异常船只',
    eventTime: '2024-06-01 13:00',
    receiveTime: '2024-06-01 13:05',
    forwardTime: '2024-06-01 13:10',
    status: '已读',
  },
  {
    id: 3,
    image: demoImg,
    content: '无关目标',
    eventTime: '2024-06-01 14:00',
    receiveTime: '2024-06-01 14:05',
    forwardTime: '2024-06-01 14:10',
    status: '不感兴趣',
  },
]);

const filterStatus = ref('');

const totalCount = computed(() => data.value.length);
const confirmedCount = computed(() => data.value.filter(item => item.status === '已读').length);
const unconfirmedCount = computed(() => data.value.filter(item => item.status === '未读').length);
const uninterestedCount = computed(() => data.value.filter(item => item.status === '不感兴趣').length);

const filteredData = computed(() => {
  if (!filterStatus.value) return data.value;
  return data.value.filter(item => item.status === filterStatus.value);
});

function setFilter(status: string) {
  filterStatus.value = status;
}

function viewDetail(record: UserIntel) {
  viewIntelligenceProfile(record.id);
}

function markUninterested(record: UserIntel) {
  // 标记为不感兴趣
  record.status = '不感兴趣';
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


// 模态框数据
const loading = ref(false);;
const profileModalVisible = ref(false);
const currentIntelligence = ref(null);

// 查看情报画像
const viewIntelligenceProfile = (id: number) => {
  loading.value = true;

  // 模拟API请求
  setTimeout(() => {
    // 查找当前情报
    const intelligence = data.value.find(item => item.id === id);
    if (intelligence) {
      currentIntelligence.value = intelligence;

      // // 生成模拟关联情报数据
      // relatedIntelligence.value = Array(Math.floor(Math.random() * 2) + 1).fill(0).map((_, index) => {
      //   const relatedId = intelligenceData.value[Math.floor(Math.random() * intelligenceData.value.length)].id;
      //   return intelligenceData.value.find(item => item.id === relatedId) || {
      //     id: `INT-${Math.floor(Math.random() * 1000) + 10000}`,
      //     content: `相关情报${index + 1}，包含与当前情报相似的目标活动`,
      //   };
      // });

      loading.value = false;
      profileModalVisible.value = true;
    } else {
      message.error('未找到相关情报信息');
      loading.value = false;
    }
  }, 500);
};

function recoverRecommend(record: UserIntel) {
  record.status = '已读';
  // 如果是当前详情，强制刷新 currentIntelligence
  if (currentIntelligence.value && currentIntelligence.value.id === record.id) {
    currentIntelligence.value = { ...record } as any;
  }
}
</script>

<style scoped>
.stats-row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.stat-card {
  background: #f0f2f5;
  border-radius: 8px;
  padding: 16px 24px;
  min-width: 140px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  cursor: default;
}

.stat-card.clickable {
  cursor: pointer;
  transition: box-shadow 0.2s, border 0.2s;
}

.stat-card.clickable.active,
.stat-card.clickable:hover {
  border: 2px solid #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.12);
}

.icon-status {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.stat-label {
  color: #888;
  font-size: 14px;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
  color: #1890ff;
}

.profile-image {
  margin: 20px 0;
  text-align: center;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
  }

}
</style>
