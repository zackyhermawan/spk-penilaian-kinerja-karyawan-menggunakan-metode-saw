import express from "express"
import cors from "cors"
import { errorHandler } from "./middlewares/error.middleware.js"

import authRoutes from "./modules/auth/auth.route.js"
import positionRoutes from "./modules/position/position.route.js"
import employeeRoutes from "./modules/employee/employee.route.js"
import criteriaRoutes from "./modules/criteria/criteria.route.js"
import positionCriteriaRoutes from "./modules/positionCriteria/positionCriteria.route.js"
import periodRoutes from "./modules/period/period.route.js"
import periodEmployeeRoutes from "./modules/periodEmployee/periodEmployee.route.js"
import ratingScaleRoutes from "./modules/ratingScale/ratingScale.route.js"
import profileRoutes from "./modules/profile/profile.route.js"
import evaluationRoutes from "./modules/evaluation/evaluation.route.js"
import dashboardAdminRoutes from "./modules/dashboard/dashboard.route.js"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.json({
    message: "Hello World!"
  })
})

app.use("/api/auth", authRoutes)
app.use("/api/positions", positionRoutes)
app.use("/api/employees", employeeRoutes)
app.use("/api/criterias", criteriaRoutes)
app.use("/api/position-criterias", positionCriteriaRoutes)
app.use("/api/periods", periodRoutes)
app.use("/api/period-employees", periodEmployeeRoutes)
app.use("/api/rating-scales", ratingScaleRoutes)
app.use("/api/profiles", profileRoutes)
app.use("/api/evaluations", evaluationRoutes)
app.use("/api/dashboards", dashboardAdminRoutes)

app.use(errorHandler)

export default app