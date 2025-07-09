<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { computed, onMounted, onActivated, watch, getCurrentInstance } from 'vue';
import { useAuthStore } from '@/stores/auth';
const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();

// 应用启动时恢复用户信息
onMounted(() => {
  if (!authStore.userInfo) {
    authStore.initUserInfo();
  }
});

const username = computed(() => authStore.userInfo?.username || '');

// 菜单配置映射表
const menuMap: Record<string, string> = {
  '/dashboard': '实时监控',
  '/userTag': '基础信息',
  '/mapView': '大屏演示',
  '/intel': '情报收件箱',
  '/algorithm': '算法列表'
  // 可扩展更多
};

// 动态菜单项
const menuItems = computed(() => {
  const urls = authStore.userInfo?.permissionUrls || [];
  // 只显示有权限且在menuMap中的菜单
  console.log(urls)
  return urls.filter(url => menuMap[url]).map(url => ({
    key: url.replace(/^\//, ''),
    path: url,
    label: menuMap[url],
  }));

});

// 当前选中菜单key
const selectedKeys = computed(() => {
  // 取当前路由的一级path作为key
  const path = '/' + (route.path.split('/')[1] || '');
  return [path.replace(/^\//, '')];
});

function logout() {
  authStore.logout();
  router.push('/login');
}

onActivated(() => {
  // 这里写页面激活时的刷新逻辑
});

watch(() => route.fullPath, () => {
  // 这里写路由变化时的刷新逻辑
});
</script>

<template>
  <a-layout class="layout">
    <!-- 只在非登录页显示header和菜单 -->
    <template v-if="route.path !== '/login'">
      <a-layout-header style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center;">
          <div class="logo" />
          <a style="color: white; margin: 0; font-size: 20px;"> 多域情景态势信息管理</a>
          <a-menu mode="horizontal" theme="dark" :selectedKeys="selectedKeys"
            style="margin-left: 40px; display: inline-block; vertical-align: middle; background: transparent; border-bottom: none;">
            <a-menu-item v-for="item in menuItems" :key="item.key">
              <router-link :to="item.path">{{ item.label }}</router-link>
            </a-menu-item>
          </a-menu>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <span style="color: #fff; font-size: 16px;">
            {{ username }}<span v-if="username === 'admin'">(管理员)</span><span v-else>(机构用户)</span>
          </span>
          <a-button type="link" style="color: #fff;" @click="logout">退出登录</a-button>
        </div>
      </a-layout-header>
    </template>
    <a-layout-content style="padding: 10px; min-height: calc(100vh - 64px);">
      <Router-view />
    </a-layout-content>
  </a-layout>
</template>
