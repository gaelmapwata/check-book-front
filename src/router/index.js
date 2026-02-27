import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/modules/auth/views/LoginView.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DashboardHome from '@/modules/dashboard/views/DashboardHome.vue'

const routes = [
  {
    path: '/login',
    component: LoginView
  },
   {
    path: '/',
    component: DashboardLayout,
    children: [
      {
        path: '',
        component: DashboardHome,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
