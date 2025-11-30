import { createRouter, createWebHashHistory } from 'vue-router'

// 顶级页面
import Dashboard from '../views/Dashboard.vue'
import Stage1 from '@/views/stage1/Stage_1.vue'

// Stage 1 子页面
import LegacyHome from '@/views/stage1/LegacyHome.vue'
import News from '@/views/stage1/News.vue'
import About from '@/views/stage1/About.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/stage1',
    name: 'Stage1',
    component: Stage1,
    children: [
      {
        path: 'legacy-home',
        name: 'LegacyHome',
        component: LegacyHome
      },
      {
        path: 'news',
        name: 'News',
        component: News
      },
      {
        path: 'about',
        name: 'About',
        component: About
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router