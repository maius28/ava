import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/AdminIntelView.vue'),
    },
    {
      path: '/intel',
      name: 'intel',
      component: () => import('@/views/UserIntelView.vue'),
    },
    {
      path: '/mapView',
      name: 'mapView',
      component: () => import('@/views/MapView.vue'),
      meta: {
        title: '多域情景刻画',
        description: '使用xxx算法，定时接收遥感数据，并推荐展示给用户机构',
      },
    },
    {
      path: '/userTag',
      name: 'userTag',
      component: () => import('@/views/UserTagView.vue'),
      meta: {
        title: '知识管理',
        description: '管理用户、标签和情报的数据',
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
      path: '/algorithm',
      name: 'algorithm',
      component: () => import('@/views/AlgorithomView.vue'),
      children: [
        {
          path: 'extraction',
          name: 'extraction',
          component: () => import('@/views/Extraction.vue'),
          meta: {
            title: '情报抽取',
            description: '对情报文字进行知识抽取，提取实体、关系等信息',
          },
        },
        {
          path: 'coldStart',
          name: 'coldStart',
          component: () => import('@/views/ColdStartRecommendView.vue'),
          meta: {
            title: '态势推荐',
          },
        },
        {
          path: 'comprehensive',
          name: 'comprehensive',
          component: () => import('@/views/ComprehensiveView.vue'),
          meta: {
            title: '综合推荐',
          },
        },
        {
          path: 'similarity',
          name: 'similarity',
          component: () => import('@/views/SimilartiyRecommendView.vue'),
          meta: {
            title: '相似度/向量化推荐',
          },
        },
      ],
    },
  ],
})

// 路由白名单
const whiteList = ['/login']

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  // 1. 根路径重定向
  if (to.path === '/') {
    if (!token) {
      next('/login')
    } else {
      // 已登录，跳转到主页面（可根据用户权限跳转，见下方）
      // 这里先跳dashboard，登录后再做更细致跳转
      next('/dashboard')
    }
    return
  }

  // 2. 其他页面权限校验
  if (!token && !whiteList.includes(to.path)) {
    next('/login')
    return
  }

  next()
})

export default router
