<template>
  <div class="dashboard-container">
    <!-- 监控状态栏 -->
    <div class="map-header">
      <div class="stats-row">
        <!-- 状态统计组件 -->
        <div v-for="(stat, index) in statusStats" :key="index" class="stat-item" :class="`status-${stat.status}`">
          <div class="stat-content">
            <div class="stat-number">{{ stat.count }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>

        <!-- 详情列表按钮 -->
        <div class="detail-button-container">
          <button @click="openDetailModal" class="detail-list-btn">
            <span class="btn-text">详情列表</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="map-view-container">
      <MapWithAmap />
    </div>

    <!-- 详情列表模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="情报详情列表"
      width="90%"
      :footer="null"
      class="detail-modal"
    >
      <IntellList />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import MapWithAmap from '@/components/MapWithAmap.vue'
import IntellList from '@/components/IntellList.vue';
import { ref, reactive } from 'vue'

// 模态框控制
const detailModalVisible = ref(false)

// 状态统计数据
const statusStats = reactive([
  { status: 'total', label: '总数', count: 500, today: 8, trend: 5 },
  { status: 'pending_process', label: '待推荐', count: 8, today: 3, trend: -5 },
  { status: 'pending_push', label: '待推送', count: 15, today: 7, trend: 20 },
  { status: 'pushed', label: '已推送', count: 42, today: 12, trend: 15 }
]);

// 打开详情模态框
const openDetailModal = () => {
  detailModalVisible.value = true
}
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
}

.map-header {
  padding: 20px 24px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.stat-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  min-width: 0;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 40px rgba(0, 212, 255, 0.15);
}

.stat-item:hover::before {
  opacity: 1;
}

.stat-content {
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #00d4ff, #5b73ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  gap: 8px;
}

.today-count {
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
}

.trend-up {
  color: #00ff88;
  font-weight: 600;
  white-space: nowrap;
}

.trend-down {
  color: #ff4757;
  font-weight: 600;
  white-space: nowrap;
}

/* 不同状态的特色样式 */
.status-total .stat-number {
  background: linear-gradient(135deg, #00d4ff, #5b73ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.status-pending_process .stat-number {
  background: linear-gradient(135deg, #ffa726, #ff7043);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.status-pending_push .stat-number {
  background: linear-gradient(135deg, #ab47bc, #8e24aa);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.status-pushed .stat-number {
  background: linear-gradient(135deg, #66bb6a, #43a047);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.detail-button-container {
  flex-shrink: 0;
  margin-left: 20px;
}

.detail-list-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.detail-list-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.detail-list-btn:hover::before {
  left: 100%;
}

.detail-list-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.detail-list-btn:active {
  transform: translateY(-1px) scale(1.02);
}

.btn-icon {
  font-size: 24px;
  margin-bottom: 4px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.btn-text {
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.map-view-container {
  width: 100%;
  height: calc(100vh - 140px);
  overflow: hidden;
  position: relative;
}

/* 模态框样式 */
:deep(.detail-modal .ant-modal-content) {
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

:deep(.detail-modal .ant-modal-header) {
  background: #ffffff !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.detail-modal .ant-modal-title) {
  color: #333333;
  font-weight: 600;
}

:deep(.detail-modal .ant-modal-close) {
  color: rgba(0, 0, 0, 0.6);
}

:deep(.detail-modal .ant-modal-close:hover) {
  color: #333333;
}

:deep(.detail-modal .ant-modal-body) {
  padding: 0;
  background: transparent;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-row {
    gap: 16px;
  }

  .stat-item {
    padding: 16px;
  }

  .stat-number {
    font-size: 28px;
  }

  .detail-list-btn {
    width: 100px;
    height: 70px;
  }

  .btn-icon {
    font-size: 20px;
  }

  .btn-text {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .map-header {
    padding: 16px;
  }

  .stats-row {
    flex-wrap: wrap;
    gap: 12px;
  }

  .stat-item {
    flex: 1 1 calc(50% - 6px);
    min-width: 140px;
    padding: 12px;
  }

  .stat-number {
    font-size: 24px;
  }

  .stat-label {
    font-size: 12px;
  }

  .stat-footer {
    font-size: 11px;
  }

  .detail-button-container {
    flex: 1 1 100%;
    margin-left: 0;
    margin-top: 12px;
    display: flex;
    justify-content: center;
  }

  .detail-list-btn {
    width: 140px;
    height: 60px;
  }

  .map-view-container {
    height: calc(100vh - 180px);
  }
}

@media (max-width: 480px) {
  .stat-item {
    flex: 1 1 100%;
    min-width: auto;
  }

  .map-view-container {
    height: calc(100vh - 220px);
  }
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.stat-item:hover .stat-number {
  animation: pulse 2s infinite;
}

/* 加载动画 */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.stat-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.03),
    transparent
  );
  background-size: 200px 100%;
  animation: shimmer 3s infinite;
  pointer-events: none;
}
</style>
