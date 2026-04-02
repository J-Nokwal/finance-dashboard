import express from "express";
import userRoutes from "./routes/user.routes";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
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


app.use("/api/users", userRoutes);


export default app;
