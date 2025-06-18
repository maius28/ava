<script setup lang="ts">
import { useRouter, RouterView, useRoute } from 'vue-router'
import { ref, watch, onMounted } from 'vue';
import { DashboardOutlined, DatabaseOutlined, ExperimentOutlined } from '@ant-design/icons-vue';

const router = useRouter();
const route = useRoute();

// 当前选中的菜单项
const selectedKeys = ref(['dashboard']);

// 根据当前路由更新选中的菜单
const updateSelectedMenu = () => {
  const path = route.path.split('/')[1] || 'dashboard';
  selectedKeys.value = [path];
};

// 监听路由变化
watch(() => route.path, updateSelectedMenu, { immediate: true });

// 组件挂载时初始化选中菜单
onMounted(() => {
  updateSelectedMenu();
});

// 菜单项点击事件
const handleMenuClick = (e: any) => {
  router.push(`/${e.key}`);
};
</script>

<template>
  <a-layout class="layout">
    <a-layout-header>
      <div class="logo" />
      <a href="/" style="color: white; margin: 0; font-size: 20px;"> 多域战场态势信息管理</a>

      <!-- 添加菜单 -->
      <a-menu
        theme="dark"
        mode="horizontal"
        :selectedKeys="selectedKeys"
        @click="handleMenuClick"
        class="main-menu"
      >
        <a-menu-item key="dashboard">
          <span class="menu-icon"><dashboard-outlined /></span>
          情报监控
        </a-menu-item>
        <a-menu-item key="userTag">
          <span class="menu-icon"><database-outlined /></span>
          基础信息
        </a-menu-item>
        <a-menu-item key="mapView">
          <span class="menu-icon"><experiment-outlined /></span>
          算法演示
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout-content style="padding: 0 0 0 0; min-height: calc(100vh - 64px);">
      <RouterView/>
    </a-layout-content>
  </a-layout>
</template>

<style scoped>
.layout .ant-layout-header {
  background-color: #001529;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.logo {
  width: 30px;
  height: 30px;
  margin-right: 16px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
}

.main-menu {
  flex: 1;
  line-height: 64px;
  margin-left: 30px;
  background-color: transparent;
  font-size: 16px;
}

.menu-icon {
  margin-right: 8px;
}

/* 添加选中菜单的样式 */
:deep(.ant-menu-item.ant-menu-item-selected) {
  background-color: #1890ff !important; /* 选中时的蓝色背景 */
  color: white !important;
  font-weight: 500;
}

/* 添加悬停效果 */
:deep(.ant-menu-item:hover:not(.ant-menu-item-selected)) {
  background-color: #177ddc !important; /* 悬停时的深蓝色 */
  color: white !important;
}

.content-wrapper {
  text-align: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.product-description {
  max-width: 800px;
  margin: 10px auto 50px;
}

.feature-boxes {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.feature-box {
  width: 300px;
  height: 200px;
}
</style>
