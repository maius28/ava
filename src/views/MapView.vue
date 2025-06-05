<template>
  <div class="intel-recommend-container">
    <!-- 右上角机器人图标 -->
    <div class="algorithm-info-button" @click="showModal" ref="infoButton">
      <a-button type="primary" shape="circle">
        <template #icon><robot-outlined /></template>
      </a-button>
      <span class="info-text">点击查看算法说明</span>
    </div>

    <!-- ChinaMap 组件 -->
    <ChinaMap />

    <!-- 自定义位置和样式的模态框 -->
    <a-modal v-model:visible="modalVisible" width="400px" :footer="null" :style="modalStyle">
      <div class="algorithm-description">
        <h3>情报推荐系统原理</h3>
        <p>本系统采用基于内容和协同过滤的混合推荐算法，结合地理位置信息和用户兴趣偏好，为用户提供实时情报推送。</p>

        <h4>主要算法模块</h4>
        <ol>
          <li>
            <strong>内容特征提取</strong>：对情报文本进行NLP处理，提取关键词和实体，构建语义特征向量。
          </li>
          <li>
            <strong>用户画像建模</strong>：基于用户历史交互行为和显式反馈，构建用户兴趣模型。
          </li>
          <li>
            <strong>地理位置关联性分析</strong>：利用空间距离算法和地域相关性计算，确定情报与用户地理位置的关联度。
          </li>
          <li>
            <strong>协同过滤</strong>：基于用户行为相似性，挖掘潜在兴趣关联。
          </li>
          <li>
            <strong>多因素排序</strong>：结合情报时效性、重要程度、用户兴趣匹配度和地理位置关联度进行综合排序。
          </li>
        </ol>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import ChinaMap from '@/components/ChinaMap.vue';
import { RobotOutlined } from '@ant-design/icons-vue';
import { Button, Modal } from 'ant-design-vue';

// 控制模态框显示
const modalVisible = ref(false);
const infoButton = ref(null);

// 模态框样式
const modalStyle = reactive({
  position: 'absolute',
  top: '100px',
  right: '15px',
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
});

// 显示模态框
const showModal = () => {
  modalVisible.value = true;
};
</script>

<style scoped>
.intel-recommend-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.algorithm-info-button {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(0, 21, 41, 0.7);
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.algorithm-info-button:hover {
  background-color: rgba(0, 21, 41, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.info-text {
  color: white;
  font-size: 14px;
}

/* 深色模态框样式 */
:deep(.dark-modal .ant-modal-content) {
  background-color: rgba(0, 21, 41, 0.9);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

:deep(.dark-modal .ant-modal-header) {
  background-color: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.dark-modal .ant-modal-title) {
  color: white;
  font-weight: bold;
}

:deep(.dark-modal .ant-modal-close) {
  color: white;
}

:deep(.dark-modal .ant-modal-close:hover) {
  color: #1890ff;
}

.algorithm-description {
  line-height: 1.6;
  color: #fff;
}

.algorithm-description h3 {
  color: #1890ff;
  margin-bottom: 16px;
}

.algorithm-description h4 {
  margin-top: 16px;
  margin-bottom: 8px;
  color: #8ccef0;
}

.algorithm-description ul,
.algorithm-description ol {
  padding-left: 20px;
}

.algorithm-description li {
  margin-bottom: 8px;
}

.algorithm-description strong {
  color: #1890ff;
}
</style>