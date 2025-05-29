<template>
  <div class="intel-data-container">
    <div class="page-header">
      <div class="header-actions">
        <a-input-search v-model:value="searchValue" placeholder="搜索情报内容" style="width: 250px" @search="onSearch" />
        <a-button type="primary">
          <template #icon><plus-outlined /></template>
          添加情报
        </a-button>
      </div>
    </div>

    <a-table :columns="columns" :data-source="filteredData" :row-key="record => record.id"
      :pagination="{ pageSize: 10 }" :loading="loading">
      <!-- 影像图片列 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'image'">
          <img :src="record.image" :alt="`情报${record.id}影像`" class="intel-image"
            @click="() => showImagePreview(record.image)" />
        </template>

        <!-- 状态列 -->
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === '已推送' ? 'green' : 'orange'">
            {{ record.status }}
          </a-tag>
        </template>

        <!-- 经纬度列 -->
        <template v-if="column.key === 'coordinates'">
          <span>{{ record.latitude }}°N, {{ record.longitude }}°E</span>
        </template>

        <!-- 文本内容列 -->
        <template v-if="column.key === 'content'">
          <a-tooltip :title="record.content">
            <div class="content-cell">
              {{ record.content }}
            </div>
          </a-tooltip>
        </template>

        <!-- 操作列 -->
        <template v-if="column.key === 'action'">
          <a-button type="link" @click="showUsers(record)" v-if="record.status === '已推送'">
            查看推荐用户
          </a-button>
          <a-button type="link" v-if="record.status === '待推送'" @click="pushIntel(record)">
            推送
          </a-button>
        </template>
      </template>
    </a-table>

    <!-- 影像预览对话框 -->
    <a-modal v-model:visible="imagePreviewVisible" title="影像预览" :footer="null" width="800px">
      <img :src="previewImage" class="preview-image" alt="影像预览" />
    </a-modal>

    <!-- 推荐用户列表对话框 -->
    <a-modal v-model:visible="userListVisible" title="推荐用户列表" width="700px" :footer="null">
      <a-table :columns="userColumns" :data-source="recommendedUsers" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'tags'">
            <a-tag v-for="tag in record.tags" :key="tag" :color="getTagColor(tag)">
              {{ tag }}
            </a-tag>
          </template>
          <template v-if="column.key === 'interestLevel'">
            <a-progress :percent="record.interestLevel * 20" :stroke-color="getInterestColor(record.interestLevel)"
              size="small" />
            <span>{{ getInterestText(record.interestLevel) }}</span>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

// 表格加载状态
const loading = ref(false);

// 搜索
const searchValue = ref('');

// 图片预览
const imagePreviewVisible = ref(false);
const previewImage = ref('');

// 用户列表弹窗
const userListVisible = ref(false);
const currentIntel = ref<any>(null);
const recommendedUsers = ref([]);

// 表格列定义
const columns = [
  {
    title: '编号',
    dataIndex: 'id',
    key: 'id',
    width: '80px',
    sorter: (a, b) => a.id - b.id
  },
  {
    title: '遥感卫星编号',
    dataIndex: 'satelliteId',
    key: 'satelliteId',
    width: '120px'
  },
  {
    title: '经纬度',
    key: 'coordinates',
    width: '150px'
  },
  {
    title: '影像图片',
    key: 'image',
    width: '120px'
  },
  {
    title: '文本内容',
    key: 'content',
    dataIndex: 'content',
    width: '250px',
    ellipsis: true
  },
  {
    title: '发生时间',
    dataIndex: 'timestamp',
    key: 'timestamp',
    width: '150px',
    sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: '100px',
    filters: [
      { text: '已推送', value: '已推送' },
      { text: '待推送', value: '待推送' }
    ],
    onFilter: (value, record) => record.status === value
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: '120px'
  }
];

// 用户表格列定义
const userColumns = [
  { title: '用户ID', dataIndex: 'id', key: 'id', width: '80px' },
  { title: '用户名称', dataIndex: 'name', key: 'name', width: '120px' },
  { title: '位置', dataIndex: 'location', key: 'location', width: '150px' },
  { title: '标签', key: 'tags', width: '200px' },
  { title: '匹配度', key: 'interestLevel', width: '150px' }
];

// 模拟情报数据
const intelData = ref([
  {
    id: 1,
    satelliteId: 'JG-15A',
    latitude: 23.11,
    longitude: 113.45,
    image: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    content: '南海海域发现不明舰船集结，疑似进行军事演习。关键设施已启动监控。',
    timestamp: '2023-04-15 14:30',
    status: '已推送',
    recommendedUsers: [1, 3, 5]
  },
  {
    id: 2,
    satelliteId: 'JG-18B',
    latitude: 39.90,
    longitude: 116.40,
    image: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    content: '北京周边发现大型军事物资运输活动，可能与近期演习相关。',
    timestamp: '2023-04-16 09:45',
    status: '已推送',
    recommendedUsers: [2, 4]
  },
  {
    id: 3,
    satelliteId: 'YG-31',
    latitude: 30.67,
    longitude: 104.06,
    image: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    content: '成都地区卫星捕获到疑似新型导弹发射测试活动，技术特征与上次观测吻合。',
    timestamp: '2023-04-18 08:15',
    status: '待推送',
    recommendedUsers: []
  },
  {
    id: 4,
    satelliteId: 'YG-27',
    latitude: 45.75,
    longitude: 126.63,
    image: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    content: '东北边境附近多处雷达站开始异常活动，信号强度明显高于平时水平。',
    timestamp: '2023-04-19 11:20',
    status: '待推送',
    recommendedUsers: []
  },
  {
    id: 5,
    satelliteId: 'JG-16C',
    latitude: 22.54,
    longitude: 114.06,
    image: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    content: '深圳地区多个关键科技企业出现不明信号干扰，初步判断可能是电子情报收集活动。',
    timestamp: '2023-04-20 16:05',
    status: '已推送',
    recommendedUsers: [1, 2, 3, 4]
  }
]);

// 模拟用户数据
const userData = [
  {
    id: 1,
    name: '军事情报部',
    location: '北京市',
    tags: ['军事', '战略', '决策层'],
    interestLevel: 5  // 1-5的兴趣等级
  },
  {
    id: 2,
    name: '外交安全司',
    location: '北京市',
    tags: ['外交', '安全', '政策'],
    interestLevel: 4
  },
  {
    id: 3,
    name: '南海研究所',
    location: '广州市',
    tags: ['海洋', '研究', '南海'],
    interestLevel: 5
  },
  {
    id: 4,
    name: '国防科技大学',
    location: '长沙市',
    tags: ['技术', '研究', '军事'],
    interestLevel: 3
  },
  {
    id: 5,
    name: '战略评估中心',
    location: '北京市',
    tags: ['分析', '评估', '战略'],
    interestLevel: 4
  }
];

// 基于搜索关键词过滤数据
const filteredData = computed(() => {
  if (!searchValue.value) return intelData.value;
  return intelData.value.filter(item =>
    item.content.toLowerCase().includes(searchValue.value.toLowerCase()) ||
    item.satelliteId.toLowerCase().includes(searchValue.value.toLowerCase())
  );
});

// 搜索方法
const onSearch = (value) => {
  searchValue.value = value;
};

// 显示图片预览
const showImagePreview = (imageUrl) => {
  previewImage.value = imageUrl;
  imagePreviewVisible.value = true;
};

// 显示推荐用户
const showUsers = (record) => {
  currentIntel.value = record;

  // 获取推荐用户数据
  recommendedUsers.value = userData.filter(user =>
    record.recommendedUsers.includes(user.id)
  );

  userListVisible.value = true;
};

// 推送情报
const pushIntel = (record) => {
  loading.value = true;

  // 模拟API调用延迟
  setTimeout(() => {
    // 找到并更新情报状态
    const index = intelData.value.findIndex(item => item.id === record.id);
    if (index !== -1) {
      intelData.value[index].status = '已推送';
      // 随机分配一些推荐用户
      intelData.value[index].recommendedUsers = [1, 3, 5].filter(() => Math.random() > 0.3);
    }

    loading.value = false;
    message.success('情报已成功推送');
  }, 1000);
};

// 获取标签颜色
const getTagColor = (tag) => {
  const colorMap = {
    '军事': 'red',
    '战略': 'volcano',
    '决策层': 'purple',
    '外交': 'blue',
    '安全': 'orange',
    '政策': 'cyan',
    '海洋': 'geekblue',
    '研究': 'green',
    '南海': 'blue',
    '技术': 'cyan',
    '分析': 'lime',
    '评估': 'gold'
  };

  return colorMap[tag] || 'default';
};

// 获取兴趣等级对应的颜色
const getInterestColor = (level) => {
  const colorMap = {
    1: '#d9d9d9',
    2: '#ffa940',
    3: '#ffc53d',
    4: '#73d13d',
    5: '#52c41a'
  };

  return colorMap[level] || '#d9d9d9';
};

// 获取兴趣等级对应的文本
const getInterestText = (level) => {
  const textMap = {
    1: '低',
    2: '较低',
    3: '中等',
    4: '较高',
    5: '高'
  };

  return textMap[level] || '';
};
</script>

<style scoped>
.intel-data-container {
  padding: 24px;
  /* background: #f0f2f5; */
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.intel-image {
  width: 80px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s;
}

.intel-image:hover {
  transform: scale(1.05);
}

.preview-image {
  width: 100%;
  max-height: 600px;
  object-fit: contain;
}

.content-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>