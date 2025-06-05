<script setup lang="ts">
import { RouterLink, useRouter, RouterView } from 'vue-router'

const router = useRouter()

// 需要导航的路由
const navsRoutes = router.getRoutes()
  .filter(route => route.path !== '/')
  .filter(route => route.meta?.showHome)
</script>

<template>
  <a-layout class="layout">
    <a-layout-header>
      <div class="logo" />
      <a href="/" style="color: white; margin: 0; font-size: 20px;"> 多域战场态势信息管理
      </a>
    </a-layout-header>
    <a-layout-content style="padding: 0 0 0 0; min-height: calc(100vh - 64px);">
      <div class="content-wrapper" v-if="$route.path === '/'">
        <div class="product-description">
          <h2>算法可视化工具</h2>
          <p>描述信息</p>
        </div>

        <div class="feature-boxes">

          <a-card class="feature-box" hoverable v-for="item in navsRoutes" :key="item.path">
            <template #title>{{ item.meta?.title || '未命名路由' }}</template>
            <p>{{ item.meta?.description || '暂无描述' }}</p>

            <router-link :to="item.path">查看详情</router-link>
          </a-card>
        </div>
      </div>

      <!-- 添加 RouterView 来显示匹配的      <a-tag
        class="intel-dot"
        :style="{
          backgroundColor: item.level === 'high' ? '#ff0000' :
                           item.level === 'medium' ? '#ff9800' : '#2196f3',
          boxShadow: `0 0 10px ${item.level === 'high' ? '#ff0000' :
                                 item.level === 'medium' ? '#ff9800' : '#2196f3'}`
        }"
      ></a-tag>路由组件 -->
      <RouterView v-else />
    </a-layout-content>
  </a-layout>


</template>
<style scoped>
.layout .ant-layout-header {
  background-color: #001529;
  display: flex;
  align-items: center;
}

.logo {
  width: 30px;
  height: 30px;
  margin-right: 16px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
}

.content-wrapper {
  /* padding: 40px 0; */
  text-align: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  /* background-image: url('@/assets/bg.jpg'); */

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
<style scoped></style>
