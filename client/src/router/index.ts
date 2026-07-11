import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import RentalManagement from '../pages/RentalManagement.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      name: 'Day 1',
      component: Dashboard
    },
    {
      path: '/rent',
      name: 'Rent a Unit',
      component: RentalManagement
    }
  ],
})

export default router
