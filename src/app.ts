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

app.get("/", (req, res) => {
  console.log(req.path)
  res.json({ message: "Welcome to the Finance Dashboard API" , status: "OK" , timestamp: new Date().toISOString(),"docs": "/docs" }); 
});

// Swagger on "/docs"
// app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/docs-json", (req, res) => {
  res.sendFile("swagger.json", { root: "public" });
});

app.get("/docs", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>API Docs</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script>
          SwaggerUIBundle({
            url: '/docs-json',
            dom_id: '#swagger-ui',
          })
        </script>
      </body>
    </html>
  `);
});

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
apiRouter.use("/projects", projectRoutes);
apiRouter.use("/projects/:projectId/finance", financeRoutes);

export default app;
