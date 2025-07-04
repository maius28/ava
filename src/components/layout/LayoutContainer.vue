<template>
  <!-- 登录页面不显示菜单 -->
  <div v-if="isLoginPage">
    <RouterView />
  </div>
  <a-layout class="layout" v-else>
    <!-- 主菜单 -->
    <main-menu :selectedKeys="selectedKeys" @menu-click="handleMenuClick" />

    <a-layout-content class="main-content">
      <RouterView />
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { useRouter, RouterView, useRoute } from 'vue-router';
import { ref, watch, computed } from 'vue';
import MainMenu from '@/components/layout/MainMenu.vue';

const router = useRouter();
const route = useRoute();

// 当前选中的菜单项
const selectedKeys = ref(['dashboard']);

// 检查当前路由是否是登录页面
const isLoginPage = computed(() => {
  return route.path === '/login';
});

// 根据当前路由更新选中的菜单
const updateSelectedMenu = () => {
  const path = route.path.split('/')[1] || 'dashboard';
  selectedKeys.value = [path];
};

// 菜单项点击事件
const handleMenuClick = (key) => {
  router.push(`/${key}`);
};

// 监听路由变化
watch(() => route.path, () => {
  updateSelectedMenu();
}, { immediate: true });
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.main-content {
  padding: 0;
  min-height: calc(100vh - 64px);
}
</style>