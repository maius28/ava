<template>
  <div class="knowledge-graph-container">
    <div class="toolbar">
      <a-radio-group v-model:value="graphFocus" button-style="solid" @change="updateGraph">
        <a-radio-button value="all">全部关系</a-radio-button>
        <a-radio-button value="user">用户关系</a-radio-button>
        <a-radio-button value="intel">情报关系</a-radio-button>
        <a-radio-button value="tag">标签关系</a-radio-button>
      </a-radio-group>

      <a-select v-model:value="selectedEntity" style="width: 200px; margin-left: 16px;" placeholder="选择一个实体"
        @change="focusOnEntity">
        <a-select-opt-group label="用户">
          <a-select-option v-for="user in users" :key="`user-${user.id}`" :value="`user-${user.id}`">
            {{ user.name }}
          </a-select-option>
        </a-select-opt-group>
        <a-select-opt-group label="情报">
          <a-select-option v-for="intel in intelligence" :key="`intel-${intel.id}`" :value="`intel-${intel.id}`">
            {{ intel.name }}
          </a-select-option>
        </a-select-opt-group>
        <a-select-opt-group label="标签">
          <a-select-option v-for="tag in tags" :key="`tag-${tag.id}`" :value="`tag-${tag.id}`">
            {{ tag.name }}
          </a-select-option>
        </a-select-opt-group>
      </a-select>
    </div>

    <div class="graph-wrapper">
      <div ref="chartContainer" class="chart-container"></div>
    </div>

    <a-modal v-model:visible="detailVisible" :title="detailTitle" :footer="null" width="600px">
      <div v-if="detailData">
        <div v-if="detailData.type === 'user'" class="entity-detail">
          <h3>用户详情</h3>
          <p><strong>用户名称:</strong> {{ detailData.name }}</p>
          <p><strong>用户位置:</strong> {{ detailData.location }}</p>
          <div class="tags-container">
            <h4>关联标签:</h4>
            <div class="tags-wrapper">
              <a-tag v-for="tagId in detailData.tagIds" :key="tagId" :color="getTagColor(tagId)">
                {{ getTagName(tagId) }}
              </a-tag>
            </div>
          </div>
          <div class="intel-container">
            <h4>关注情报:</h4>
            <a-list size="small">
              <a-list-item v-for="intelId in detailData.intelIds" :key="intelId">
                {{ getIntelName(intelId) }}
              </a-list-item>
            </a-list>
          </div>
        </div>

        <div v-if="detailData.type === 'intel'" class="entity-detail">
          <h3>情报详情</h3>
          <p><strong>情报标题:</strong> {{ detailData.name }}</p>
          <p><strong>情报内容:</strong> {{ detailData.content }}</p>
          <p><strong>发布时间:</strong> {{ detailData.date }}</p>
          <div class="tags-container">
            <h4>关联标签:</h4>
            <div class="tags-wrapper">
              <a-tag v-for="tagId in detailData.tagIds" :key="tagId" :color="getTagColor(tagId)">
                {{ getTagName(tagId) }}
              </a-tag>
            </div>
          </div>
          <div class="user-container">
            <h4>关注用户:</h4>
            <a-list size="small">
              <a-list-item v-for="userId in detailData.userIds" :key="userId">
                {{ getUserName(userId) }}
              </a-list-item>
            </a-list>
          </div>
        </div>

        <div v-if="detailData.type === 'tag'" class="entity-detail">
          <h3>标签详情</h3>
          <p><strong>标签名称:</strong> {{ detailData.name }}</p>
          <p><strong>标签分类:</strong> {{ detailData.category }}</p>
          <div class="user-container">
            <h4>关联用户:</h4>
            <a-list size="small">
              <a-list-item v-for="userId in detailData.userIds" :key="userId">
                {{ getUserName(userId) }}
              </a-list-item>
            </a-list>
          </div>
          <div class="intel-container">
            <h4>关联情报:</h4>
            <a-list size="small">
              <a-list-item v-for="intelId in detailData.intelIds" :key="intelId">
                {{ getIntelName(intelId) }}
              </a-list-item>
            </a-list>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { Tag, List, Radio, Select, Modal } from 'ant-design-vue';

// 图表容器引用
const chartContainer = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;

// 过滤控制
const graphFocus = ref('all');
const selectedEntity = ref('');

// 详情模态框控制
const detailVisible = ref(false);
const detailTitle = ref('实体详情');
const detailData = ref(null);

// 模拟数据 - 用户
const users = [
  { id: 1, name: '军事情报部', location: '北京', type: 'user', tagIds: [1, 2, 5], intelIds: [1, 3, 5] },
  { id: 2, name: '外交安全司', location: '北京', type: 'user', tagIds: [2, 3], intelIds: [1, 2] },
  { id: 3, name: '南海研究所', location: '广州', type: 'user', tagIds: [1, 4], intelIds: [3, 5] },
  { id: 4, name: '国防科技大学', location: '长沙', type: 'user', tagIds: [5, 6], intelIds: [2, 4] },
  { id: 5, name: '战略评估中心', location: '上海', type: 'user', tagIds: [2, 7], intelIds: [1, 4, 5] }
];

// 模拟数据 - 情报
const intelligence = [
  { id: 1, name: '南海舰船动态', content: '南海海域发现不明舰船集结，疑似进行军事演习。', date: '2023-04-15', type: 'intel', tagIds: [1, 3], userIds: [1, 2, 5] },
  { id: 2, name: '军事物资运输', content: '北京周边发现大型军事物资运输活动，可能与近期演习相关。', date: '2023-04-16', type: 'intel', tagIds: [2, 5], userIds: [2, 4] },
  { id: 3, name: '导弹测试活动', content: '成都地区卫星捕获到疑似新型导弹发射测试活动。', date: '2023-04-18', type: 'intel', tagIds: [5, 6], userIds: [1, 3] },
  { id: 4, name: '边境雷达异动', content: '东北边境附近多处雷达站开始异常活动，信号强度明显高于平时水平。', date: '2023-04-19', type: 'intel', tagIds: [4, 7], userIds: [4, 5] },
  { id: 5, name: '信号干扰事件', content: '深圳地区多个关键科技企业出现不明信号干扰，初步判断可能是电子情报收集活动。', date: '2023-04-20', type: 'intel', tagIds: [3, 7], userIds: [1, 3, 5] }
];

// 模拟数据 - 标签
const tags = [
  { id: 1, name: '军事', category: '领域', type: 'tag', userIds: [1, 3], intelIds: [1, 3] },
  { id: 2, name: '战略', category: '性质', type: 'tag', userIds: [1, 2, 5], intelIds: [2] },
  { id: 3, name: '海洋', category: '区域', type: 'tag', userIds: [2], intelIds: [1, 5] },
  { id: 4, name: '边境', category: '区域', type: 'tag', userIds: [3], intelIds: [4] },
  { id: 5, name: '装备', category: '对象', type: 'tag', userIds: [1, 4], intelIds: [2, 3] },
  { id: 6, name: '技术', category: '性质', type: 'tag', userIds: [4], intelIds: [3] },
  { id: 7, name: '电子', category: '领域', type: 'tag', userIds: [5], intelIds: [4, 5] }
];

// 辅助函数 - 获取标签颜色
const getTagColor = (tagId: number) => {
  const colorMap = {
    1: '#ff4d4f', // 军事 - 红色
    2: '#faad14', // 战略 - 黄色
    3: '#1890ff', // 海洋 - 蓝色
    4: '#52c41a', // 边境 - 绿色
    5: '#722ed1', // 装备 - 紫色
    6: '#13c2c2', // 技术 - 青色
    7: '#eb2f96'  // 电子 - 粉色
  };
  return colorMap[tagId] || '#d9d9d9';
};

// 辅助函数 - 获取实体名称
const getTagName = (tagId: number) => {
  const tag = tags.find(tag => tag.id === tagId);
  return tag ? tag.name : '未知标签';
};

const getUserName = (userId: number) => {
  const user = users.find(user => user.id === userId);
  return user ? user.name : '未知用户';
};

const getIntelName = (intelId: number) => {
  const intel = intelligence.find(intel => intel.id === intelId);
  return intel ? intel.name : '未知情报';
};

// 生成图谱数据
const generateGraphData = (focus = 'all', focusEntityId = null) => {
  let nodes = [];
  const links = [];

  // 根据选择的过滤条件添加节点
  if (focus === 'all' || focus === 'user') {
    users.forEach(user => {
      nodes.push({
        id: `user-${user.id}`,
        name: user.name,
        symbolSize: 40,
        value: user,
        category: 0,
        label: {
          show: true
        }
      });
    });
  }

  if (focus === 'all' || focus === 'intel') {
    intelligence.forEach(intel => {
      nodes.push({
        id: `intel-${intel.id}`,
        name: intel.name,
        symbolSize: 35,
        value: intel,
        category: 1,
        label: {
          show: true
        }
      });
    });
  }

  if (focus === 'all' || focus === 'tag') {
    tags.forEach(tag => {
      nodes.push({
        id: `tag-${tag.id}`,
        name: tag.name,
        symbolSize: 30,
        value: tag,
        category: 2,
        label: {
          show: true
        },
        itemStyle: {
          color: getTagColor(tag.id)
        }
      });
    });
  }

  // 添加关系连接
  if ((focus === 'all' || focus === 'user' || focus === 'tag') &&
    !(focusEntityId && !focusEntityId.startsWith('user-') && !focusEntityId.startsWith('tag-'))) {
    // 用户-标签关系
    users.forEach(user => {
      user.tagIds.forEach(tagId => {
        if ((focus === 'all' || focus === 'user' || focus === 'tag') &&
          (!focusEntityId || focusEntityId === `user-${user.id}` || focusEntityId === `tag-${tagId}`)) {
          links.push({
            source: `user-${user.id}`,
            target: `tag-${tagId}`,
            value: '具有标签',
            lineStyle: {
              color: '#1890ff',
              width: 2
            }
          });
        }
      });
    });
  }

  if ((focus === 'all' || focus === 'intel' || focus === 'tag') &&
    !(focusEntityId && !focusEntityId.startsWith('intel-') && !focusEntityId.startsWith('tag-'))) {
    // 情报-标签关系
    intelligence.forEach(intel => {
      intel.tagIds.forEach(tagId => {
        if ((focus === 'all' || focus === 'intel' || focus === 'tag') &&
          (!focusEntityId || focusEntityId === `intel-${intel.id}` || focusEntityId === `tag-${tagId}`)) {
          links.push({
            source: `intel-${intel.id}`,
            target: `tag-${tagId}`,
            value: '包含主题',
            lineStyle: {
              color: '#52c41a',
              width: 2
            }
          });
        }
      });
    });
  }

  if ((focus === 'all' || focus === 'user' || focus === 'intel') &&
    !(focusEntityId && !focusEntityId.startsWith('user-') && !focusEntityId.startsWith('intel-'))) {
    // 用户-情报关系
    users.forEach(user => {
      user.intelIds.forEach(intelId => {
        if ((focus === 'all' || focus === 'user' || focus === 'intel') &&
          (!focusEntityId || focusEntityId === `user-${user.id}` || focusEntityId === `intel-${intelId}`)) {
          links.push({
            source: `user-${user.id}`,
            target: `intel-${intelId}`,
            value: '关注',
            lineStyle: {
              color: '#fa541c',
              width: 2
            }
          });
        }
      });
    });
  }

  // 如果是聚焦模式，只保留与焦点实体直接相关的节点
  if (focusEntityId) {
    const relatedNodeIds = new Set();
    relatedNodeIds.add(focusEntityId);

    // 找出与焦点实体直接相关的节点ID
    links.forEach(link => {
      if (link.source === focusEntityId) {
        relatedNodeIds.add(link.target);
      } else if (link.target === focusEntityId) {
        relatedNodeIds.add(link.source);
      }
    });

    // 过滤节点，只保留相关的
    nodes = nodes.filter(node => relatedNodeIds.has(node.id));
  }

  return { nodes, links };
};

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return;

  // 创建 ECharts 实例
  chart = echarts.init(chartContainer.value);

  // 生成图谱数据
  const { nodes, links } = generateGraphData(graphFocus.value);

  // 图表配置
  const option = {
    title: {
      text: '用户-情报-标签 知识图谱',
      top: 'top',
      left: 'center'
    },
    tooltip: {
      formatter: (params) => {
        if (params.dataType === 'node') {
          const data = params.data.value;
          if (data.type === 'user') {
            return `<strong>${data.name}</strong><br/>
                    类型: 用户<br/>
                    位置: ${data.location}<br/>
                    标签数: ${data.tagIds.length}<br/>
                    关注情报数: ${data.intelIds.length}`;
          } else if (data.type === 'intel') {
            return `<strong>${data.name}</strong><br/>
                    类型: 情报<br/>
                    日期: ${data.date}<br/>
                    关联标签数: ${data.tagIds.length}<br/>
                    关注用户数: ${data.userIds.length}`;
          } else if (data.type === 'tag') {
            return `<strong>${data.name}</strong><br/>
                    类型: 标签<br/>
                    分类: ${data.category}<br/>
                    关联用户数: ${data.userIds.length}<br/>
                    关联情报数: ${data.intelIds.length}`;
          }
        } else if (params.dataType === 'edge') {
          return params.data.value;
        }
        return '';
      }
    },
    legend: {
      data: ['用户', '情报', '标签'],
      icon: 'circle',
      top: 'bottom',
      selectedMode: 'multiple',
      textStyle: {
        color: '#333'
      }
    },
    series: [{
      type: 'graph',
      layout: 'force',
      data: nodes,
      links: links,
      categories: [
        { name: '用户' },
        { name: '情报' },
        { name: '标签' }
      ],
      roam: true, // 是否允许缩放和拖拽
      label: {
        position: 'right', // 标签位置
        show: true,
        formatter: '{b}'
      },
      force: {
        repulsion: 200, // 排斥力
        edgeLength: 120, // 边长
        gravity: 0.1 // 重力
      },
      lineStyle: {
        color: 'source', // 线条颜色
        curveness: 0, // 曲线程度
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1,
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      },
      emphasis: {
        lineStyle: {
          width: 6
        },
        scale: true // 鼠标悬停时放大
      }
    }]
  };

  // 设置图表配置
  chart.setOption(option);

  // 添加点击事件
  chart.on('click', 'series.graph.nodes', (params) => {
    showNodeDetail(params.data.value);
  });
};

// 更新图表
const updateGraph = () => {
  if (!chart) return;

  const { nodes, links } = generateGraphData(graphFocus.value, selectedEntity.value || null);

  chart.setOption({
    series: [{
      data: nodes,
      links: links
    }]
  });
};

// 根据实体聚焦图谱
const focusOnEntity = (entityId) => {
  if (!chart) return;

  const { nodes, links } = generateGraphData(graphFocus.value, entityId);

  chart.setOption({
    series: [{
      data: nodes,
      links: links
    }]
  });

  // 可选：自动显示详情
  if (entityId) {
    const parts = entityId.split('-');
    const type = parts[0];
    const id = parseInt(parts[1]);

    let entity = null;
    if (type === 'user') {
      entity = users.find(user => user.id === id);
    } else if (type === 'intel') {
      entity = intelligence.find(intel => intel.id === id);
    } else if (type === 'tag') {
      entity = tags.find(tag => tag.id === id);
    }

    if (entity) {
      showNodeDetail(entity);
    }
  }
};

// 显示节点详情
const showNodeDetail = (nodeData) => {
  detailData.value = nodeData;

  switch (nodeData.type) {
    case 'user':
      detailTitle.value = `用户详情: ${nodeData.name}`;
      break;
    case 'intel':
      detailTitle.value = `情报详情: ${nodeData.name}`;
      break;
    case 'tag':
      detailTitle.value = `标签详情: ${nodeData.name}`;
      break;
  }

  detailVisible.value = true;
};

// 生命周期钩子
onMounted(() => {
  initChart();

  // 添加窗口大小变化监听
  window.addEventListener('resize', () => {
    chart?.resize();
  });
});

onUnmounted(() => {
  if (chart) {
    chart.dispose();
    chart = null;
  }
  window.removeEventListener('resize', () => { });
});
</script>

<style scoped>
.knowledge-graph-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f0f2f5;
}

.toolbar {
  padding: 16px;
  background-color: white;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
}

.graph-wrapper {
  flex: 1;
  position: relative;
  width: 100%;
  height: calc(100vh - 180px);
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin: 16px;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.entity-detail {
  padding: 8px;
}

.entity-detail h3 {
  margin-bottom: 16px;
  color: #1890ff;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 8px;
}

.entity-detail h4 {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: bold;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
</style>