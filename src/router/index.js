import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import OrdersView from '../views/OrdersView.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
  },
  {
    path: '/orders',
    name: 'Orders',
    component: OrdersView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
