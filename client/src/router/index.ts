import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../pages/Dashboard.vue";
import RentalManagement from "../pages/RentalManagement.vue";
import UnitManagement from "../pages/UnitManagement.vue";
import RentailDetail from "../pages/rental-detail/index.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/dashboard",
      name: "dashboard",
      component: Dashboard,
    },
    {
      path: "/rent",
      name: "rent",
      component: RentalManagement,
    },
    {
      path: "/rent-detail/:id",
      name: "rent-detail",
      component: RentailDetail,
      props: true,
    },
    {
      path: "/unit",
      name: "unit",
      component: UnitManagement,
    },
  ],
});

export default router;
