<template>
  <a-layout class="layout-container">
    <!-- 左侧导航栏 -->
    <a-layout-sider width="200">
      <a-menu mode="inline" v-model:selectedKeys="selectedKeys" style="height: 100%" theme="dark"
        @select="handleMenuSelect">
        <a-menu-item key="graph">
          <user-outlined />
          <span>知识图谱</span>
        </a-menu-item>
        <a-menu-item key="users">
          <user-outlined />
          <span>用户管理</span>
        </a-menu-item>
        <a-menu-item key="tags">
          <tags-outlined />
          <span>标签管理</span>
        </a-menu-item>
        <a-menu-item key="intels">
          <robot-outlined />
          <span>情报管理</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!-- 右侧内容区 -->
    <a-layout-content class="content-container">

      <!-- 使用RouterView显示子路由组件 -->
      <RouterView />
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute, RouterView } from 'vue-router';
import { UserOutlined, TagsOutlined, RobotOutlined } from '@ant-design/icons-vue';

const router = useRouter();
const route = useRoute();
const selectedKeys = ref<string[]>(['users']);

// 处理菜单选择事件
const handleMenuSelect = ({ key }: { key: string }) => {
  console.log('Selected menu item:', key);
  router.push(`/userTag/${key}`);
};

// 根据当前路由更新选中的菜单项
const updateSelectedMenu = () => {
  const pathParts = route.path.split('/');
  const currentChild = pathParts[pathParts.length - 1];
  if (currentChild) {
    selectedKeys.value = [currentChild];
  } else {
    // 默认选择第一个菜单项
    selectedKeys.value = ['users'];
    // 自动导航到默认子路由
    router.push('/userTag/users');
  }
};

// 监听路由变化
watch(() => route.path, updateSelectedMenu);

// 组件挂载时初始化
onMounted(() => {
  updateSelectedMenu();
});
</script>

<style scoped>
.layout-container {
  min-height: calc(100vh - 64px);
}

.content-container {
  padding: 24px;
  background: #fff;
}

.table-operations {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
}
</style>