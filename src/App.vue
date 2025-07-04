<script setup lang="ts">
import MainMenu from '@/components/layout/MainMenu.vue'
</script>

<template>
  <MainMenu />
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
