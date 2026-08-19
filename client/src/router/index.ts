import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../pages/Dashboard.vue";
import RentalManagement from "../pages/RentalManagement.vue";
import UnitManagement from "../pages/UnitManagement.vue";
import RentailDetail from "../pages/rental-detail/index.vue";
import NewRental from "../pages/new-rental/NewRental.vue";
import NotFound from "../pages/NotFound.vue";
import TransactionReport from "../pages/TransactionReport.vue";
import FinancialStatements from "../pages/FinancialStatements.vue";
import Login from "../pages/Login.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    },
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
          beforeEnter: (to, _, next) => {
            const param = to.params.unitId;
            const toNumber = Number(param);

            if (param !== undefined && (isNaN(toNumber) || toNumber <= 0)) {
              next({ name: "NotFound" });
            } else {
              next();
            }
          },
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
    {
      path: "/transaction-report",
      name: "transaction-report",
      component: TransactionReport,
    },
    {
      path: "/financial-statements",
      name: "financial-statements",
      component: FinancialStatements,
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
