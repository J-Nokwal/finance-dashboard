import express, { Router } from "express";
import userRoutes from "./modules/user/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import organizationRoutes from "./modules/organization/organization.routes";
import invitationRoutes from "./modules/invitation/invitation.routes";
import projectRoutes from "./modules/project/project.routes";
import financeRoutes from "./modules/finance/finance.routes";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./core/config/swagger";
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', function(req, res){
res.sendFile(__dirname + '/public/index.html');
});

// Swagger on "/docs"
// app.use("/docs", swaggerUi.serve, swaggerUi.setup(undefined, {
//   swaggerUrl: "/swagger.json",
// }));
/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check API
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});
const apiRouter = Router();
app.use("/api",apiRouter);

apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/organizations",organizationRoutes);
apiRouter.use("/invitations", invitationRoutes);
apiRouter.use("/projects", projectRoutes);
apiRouter.use("/projects/:projectId/finance", financeRoutes);

export default app;
