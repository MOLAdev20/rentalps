import { createRouter, createWebHistory } from 'vue-router'
import DashboardContent from '../components/DashboardContent.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      name: 'Day 1',
      component: DashboardContent
    }
  ],
})

export default router
