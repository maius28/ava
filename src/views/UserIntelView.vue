<!-- 用户情报收集 -->
<template>
  <div>
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">情报总数</div>
        <div class="stat-value">{{ totalCount }}</div>
      </div>
      <div class="stat-card clickable" :class="{ active: filterStatus === '已确认' }" @click="setFilter('已确认')">
        <div class="stat-label">已确认</div>
        <div class="stat-value">{{ confirmedCount }}</div>
      </div>
      <div class="stat-card clickable" :class="{ active: filterStatus === '未确认' }" @click="setFilter('未确认')">
        <div class="stat-label">未确认</div>
        <div class="stat-value">{{ unconfirmedCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">不感兴趣</div>
        <div class="stat-value">{{ uninterestedCount }}</div>
      </div>
    </div>
    <a-table :columns="columns" :data-source="filteredData" row-key="id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'image'">
          <img :src="record.image" alt="遥感图像"
            style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px;" />
        </template>
        <template v-else-if="column.dataIndex === 'actions'">
          <a @click="viewDetail(record)">查看详情</a>
          <a-divider type="vertical" />
          <a @click="markUninterested(record)">不感兴趣</a>
        </template>
        <template v-else>
          {{ record[column.dataIndex] }}
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface UserIntel {
  id: number;
  longitude: number;
  latitude: number;
  image: string;
  content: string;
  eventTime: string;
  receiveTime: string;
  forwardTime: string;
  status: string; // '已确认' | '未确认' | '不感兴趣'
}

const columns = [
  { title: 'Id', dataIndex: 'id', key: 'id' },
  { title: '经度', dataIndex: 'longitude', key: 'longitude' },
  { title: '纬度', dataIndex: 'latitude', key: 'latitude' },
  { title: '遥感图像', dataIndex: 'image', key: 'image' },
  { title: '文本内容', dataIndex: 'content', key: 'content' },
  { title: '发生时间', dataIndex: 'eventTime', key: 'eventTime' },
  { title: '接收时间', dataIndex: 'receiveTime', key: 'receiveTime' },
  { title: '转发时间', dataIndex: 'forwardTime', key: 'forwardTime' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', dataIndex: 'actions', key: 'actions' },
];

const data = ref<UserIntel[]>([
  {
    id: 1,
    longitude: 120.12,
    latitude: 30.28,
    image: 'https://via.placeholder.com/80x60',
    content: '疑似目标出现',
    eventTime: '2024-06-01 12:00',
    receiveTime: '2024-06-01 12:05',
    forwardTime: '2024-06-01 12:10',
    status: '未确认',
  },
  {
    id: 2,
    longitude: 121.15,
    latitude: 31.22,
    image: 'https://via.placeholder.com/80x60',
    content: '发现异常船只',
    eventTime: '2024-06-01 13:00',
    receiveTime: '2024-06-01 13:05',
    forwardTime: '2024-06-01 13:10',
    status: '已确认',
  },
  {
    id: 3,
    longitude: 122.11,
    latitude: 32.11,
    image: 'https://via.placeholder.com/80x60',
    content: '无关目标',
    eventTime: '2024-06-01 14:00',
    receiveTime: '2024-06-01 14:05',
    forwardTime: '2024-06-01 14:10',
    status: '不感兴趣',
  },
]);

const filterStatus = ref('');

const totalCount = computed(() => data.value.length);
const confirmedCount = computed(() => data.value.filter(item => item.status === '已确认').length);
const unconfirmedCount = computed(() => data.value.filter(item => item.status === '未确认').length);
const uninterestedCount = computed(() => data.value.filter(item => item.status === '不感兴趣').length);

const filteredData = computed(() => {
  if (!filterStatus.value) return data.value;
  return data.value.filter(item => item.status === filterStatus.value);
});

function setFilter(status: string) {
  filterStatus.value = status;
}

function viewDetail(record: UserIntel) {
  // 查看详情逻辑
  alert(`查看详情: 情报ID ${record.id}`);
}

function markUninterested(record: UserIntel) {
  // 标记为不感兴趣
  record.status = '不感兴趣';
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
</style>