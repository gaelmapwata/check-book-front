import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/modules/auth/views/LoginView.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DashboardHome from '@/modules/dashboard/views/DashboardHome.vue'
import RessourcesView from '@/modules/ressources/views/RessourcesView.vue'
import PermissionsView from '@/modules/permissions/views/PermissionsView.vue'
import RolesView from '@/modules/roles/views/RolesView.vue'
import CountriesView from '@/modules/countries/views/CountriesView.vue'
import BanksView from '@/modules/banks/views/BanksView.vue'
import BranchesView from '@/modules/branches/views/BranchesView.vue'
import UsersView from '@/modules/users/views/UsersView.vue'

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
      {
        path: 'ressources',
        component: RessourcesView,
      },
      {
        path: 'permissions',
        component: PermissionsView,
      },
      {
        path: 'roles',
        component: RolesView,
      },
      {
        path: 'countries',
        component: CountriesView,
      },
      {
        path: 'banks',
        component: BanksView,
      },
      {
        path: 'branches',
        component: BranchesView,
      },
      {
        path: 'users',
        component: UsersView,
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
