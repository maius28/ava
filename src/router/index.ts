import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: App,
    },
    {
      path: '/intelRecommend',
      name: 'intelRecommend',
      component: () => import('@/views/IntelRecommendView.vue'),
      meta: {
        title: '情报推荐',
        description: '使用xxx算法，定时接收遥感数据，并推荐展示给用户机构',
        showHome: true,
      },
    },
    {
      path: '/userTag',
      name: 'userTag',
      component: () => import('@/views/UserTagView.vue'),
      meta: {
        title: '用户情报标签管理',
        description: '管理用户、标签和情报的数据，解析情报数据，生成标签',
        showHome: true,
      },
      children: [
        {
          path: 'graph',
          name: 'graph',
          component: () => import('@/components/KnowledgeGraph.vue'),
          meta: {
            title: '知识图谱',
          },
        },
        {
          path: 'intels',
          name: 'intels',
          component: () => import('@/components/IntelData.vue'),
          meta: {
            title: '情报管理',
          },
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/components/UserData.vue'),
          meta: {
            title: '用户管理',
          },
        },
        {
          path: 'tags',
          name: 'tags',
          component: () => import('@/components/TagData.vue'),
          meta: {
            title: '标签管理',
          },
        },
      ],
    },
    {
      path: '/bee',
      name: 'bee',
      component: () => import('@/views/IntelRecommendView.vue'),
      meta: {
        title: '待定',
        description: '暂无描述',
        showHome: true,
      },
    },
  ],
})

export default router
