<template>
  <div class="algorithm-view">
    <a-menu mode="horizontal" :selectedKeys="[selectedKey]" @click="onMenuClick" style="margin-bottom: 5px;">
      <a-menu-item v-for="item in subMenus" :key="item.path">
        {{ item.meta?.title || item.name }}
      </a-menu-item>
    </a-menu>
    <div class="algorithm-content">
      <Router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted } from 'vue';

const route = useRoute();
const router = useRouter();

// 获取/algorithm下的子菜单
const subMenus = computed(() => {
  const algorithmRoute = router.options.routes.find(r => r.path === '/algorithm');
  if (algorithmRoute && algorithmRoute.children) {
    return algorithmRoute.children;
  }
  return [];
});

const selectedKey = computed(() => {
  // 选中当前二级路由path
  const matched = route.matched.find(r => r.path.startsWith('/algorithm/') && r.path !== '/algorithm');
  return matched ? matched.path.replace('/algorithm/', '') : subMenus.value[0]?.path;
});

function onMenuClick({ key }: { key: string }) {
  router.push(`/algorithm/${key}`);
}

onMounted(() => {
  if (route.path === '/algorithm' && subMenus.value.length > 0) {
    router.replace(`/algorithm/${subMenus.value[0].path}`);
  }
});
</script>

<style scoped>
.algorithm-view {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

.algorithm-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  padding: 20px;
  min-height: 400px;
}
</style>
