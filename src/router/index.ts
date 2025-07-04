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
        title: '多域战场情景刻画',
        description: '使用xxx算法，定时接收遥感数据，并推荐展示给用户机构',
        showHome: true,
      },
    },
    {
      path: '/userTag',
      name: 'userTag',
      component: () => import('@/views/UserTagView.vue'),
      meta: {
        title: '知识管理',
        description: '管理用户、标签和情报的数据',
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
      path: '/extraction',
      name: 'extraction',
      component: () => import('@/views/IntelDataExtractionView.vue'),
      meta: {
        title: '情报抽取',
        description: '对情报文字进行知识抽取，提取实体、关系等信息',
        showHome: true,
      },
    },
    {
      path: '/recommend',
      name: 'recommend',
      component: () => import('@/views/RecommendView.vue'),
      meta: {
        title: '情报推荐',
        description: '根据用户的历史行为和偏好，推荐相关情报',
        showHome: true,
      },
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
