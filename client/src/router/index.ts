import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../pages/Dashboard.vue";
import RentalManagement from "../pages/RentalManagement.vue";
import UnitManagement from "../pages/UnitManagement.vue";
import RentailDetail from "../pages/rental-detail/index.vue";
import NewRental from "../pages/NewRental.vue";
import NotFound from "../pages/NotFound.vue";

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
      children: [
        {
          path: "",
          name: "rent",
          component: RentalManagement,
        },
        {
          path: "new/:unitId",
          name: "new-rent",
          component: NewRental,
          props: true,
        },
        {
          path: "detail/:id",
          name: "rent-detail",
          component: RentailDetail,
          props: true,
        },
      ],
    },
    {
      path: "/unit",
      name: "unit",
      component: UnitManagement,
    },
    // --- Wajib ditaro di paling bawah ---
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: NotFound,
    },
  ],
});

export default router;
