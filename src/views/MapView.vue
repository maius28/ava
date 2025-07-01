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
        第三种
      </a-button>
      <a-button type="primary" class="algo-button" :class="{ active: selectedAlgorithm === 'custom' }"
        @click="selectAlgorithm('crossDomain')">
        跨域场景
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
const selectedAlgorithm = ref('personalized');

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

/* 右上角算法按钮样式 */
.algorithm-buttons {
  position: absolute;
  top: 10px;
  /* 距离顶部的距离 */
  left: 50%;
  /* 水平居中 */
  transform: translateX(-50%);
  /* 水平居中对齐 */
  display: flex;
  gap: 10px;
  /* 按钮之间的间距 */
  z-index: 10;
  /* 半透明背景 */
  padding: 10px 20px;
  /* 内边距 */
  border-radius: 8px;
  /* 圆角 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  /* 阴影效果 */


}

.algo-button {
  flex: 1;
  /* 按钮等宽 */
  text-align: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.algo-button.active {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
  box-shadow: 0 0 10px rgba(24, 144, 255, 0.5);
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
