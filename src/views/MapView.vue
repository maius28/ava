<template>
  <div class="intel-recommend-container">
    <div class="algorithm-buttons">
      <a-button type="primary" class="algo-button" :class="{ active: selectedAlgorithm === 'personalized' }"
        @click="selectAlgorithm('personalized')">
        态势推荐
      </a-button>
      <a-button type="primary" class="algo-button" :class="{ active: selectedAlgorithm === 'similarity' }"
        @click="selectAlgorithm('similarity')">
        第二种算法
      </a-button>
      <a-button type="primary" class="algo-button" :class="{ active: selectedAlgorithm === 'sequence' }"
        @click="selectAlgorithm('sequence')">
        第三种算法
      </a-button>
      <a-button type="primary" class="algo-button" :class="{ active: selectedAlgorithm === 'graph' }"
        @click="selectAlgorithm('graph')">
        跨域融合
      </a-button>
    </div>
    <!-- ChinaMap 组件 -->
    <ChinaMap :algorithm="selectedAlgorithm" />

  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import ChinaMap from '@/components/board/ChinaMap.vue';


// 当前选中的算法
const selectedAlgorithm = ref('');

// 选择算法
const selectAlgorithm = (algorithm: string) => {
  selectedAlgorithm.value = algorithm;

  // 这里可以添加更新地图数据或其他操作
  console.log(`选择了算法: ${algorithm}`);
};
</script>

<style scoped>
.intel-recommend-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 算法按钮样式 */
.algorithm-buttons {
  position: absolute;
  top: 10px; /* 调整到地图上方 */
  left: 50%;
  transform: translateX(-50%); /* 居中对齐 */
  z-index: 10;
  display: flex;
  flex-direction: row; /* 横向排列 */
  gap: 15px; /* 按钮间距 */
}

.algo-button {
  min-width: 150px;
  height: 40px;
  text-align: center;
  border-radius: 4px;
  transition: all 0.3s;
  opacity: 0.9;
  background-color: rgba(0, 21, 41, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.algo-button:hover {
  opacity: 1;
  transform: scale(1.05); /* 鼠标悬停时放大 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.algo-button.active {
  background-color: #0050b3; /* 选中后颜色变深 */
  opacity: 1;
  border-color: #0050b3;
  box-shadow: 0 0 10px rgba(0, 80, 179, 0.5);
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
</style>
