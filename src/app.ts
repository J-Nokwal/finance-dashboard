import express, { Router } from "express";
import userRoutes from "./modules/user/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import organizationRoutes from "./modules/organization/organization.routes";
import invitationRoutes from "./modules/invitation/invitation.routes";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./core/config/swagger";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Finance Dashboard API" , status: "OK" , timestamp: new Date().toISOString(),"docs": "/docs" }); 

});

// Swagger on root "/"
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
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

export default app;
