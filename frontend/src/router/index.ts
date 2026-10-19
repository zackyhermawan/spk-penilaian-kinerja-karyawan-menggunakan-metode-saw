import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/auth/Login.vue";

import Dashboard from "../pages/dashboard/Dashboard.vue";
import Evaluation from "../pages/evaluation/Evaluation.vue";
import PeriodList from "../pages/period/PeriodList.vue";
import PositionList from "../pages/position/PositionList.vue";
import EmployeeList from "../pages/employee/EmployeeList.vue";
import CriteriaList from "../pages/criteria/CriteriaList.vue";
import PositionCriteriaList from "../pages/positionCriteria/PositionCriteriaList.vue";
import RatingScaleList from "../pages/ratingScales/ratingScaleList.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/login",
            name: "login",
            component: Login,
            meta: {
                guest: true
            }
        },
        {
            path: "/dashboards",
            name: "dashboards",
            component: Dashboard,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: "/positions",
            name: "positions",
            component: PositionList,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: "/employees",
            name: "employees",
            component: EmployeeList,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: "/criterias",
            name: "criterias",
            component: CriteriaList,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: "/position-criterias",
            name: "position-criterias",
            component: PositionCriteriaList,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: "/rating-scales",
            name: "rating-scales",
            component: RatingScaleList,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: "/periods",
            name: "periods",
            component: PeriodList,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: "/periods/:id/evaluation",
            name: "evaluation",
            component: Evaluation,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: "/",
            redirect: "/login",
        },
        {
            path: "/:pathMatch(.*)*",
            redirect: "/",
        },
    ]
})

router.beforeEach((to) => {
    const token = localStorage.getItem("token")

    if(to.meta.requiresAuth && !token) {
        return {
            name: "login"
        }
    }

    if(to.meta.guest && token) {
        return {
            name: "dashboards"
        }
    }
})

export default router