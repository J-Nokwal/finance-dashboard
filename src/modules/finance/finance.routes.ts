import { Router } from "express";
import recordRoutes from "./record/record.routes";
import categoryRoutes from "./category/category.routes";
import tagRoutes from "./tag/tag.routes";
import summaryRoutes from "./summary/summary.routes";
const router = Router(); // Base: /projects/:projectId/finance
router.use("/records",  recordRoutes);
router.use("/categories",  categoryRoutes);
router.use("/tags",  tagRoutes);
router.use("/summary",  summaryRoutes);
export default router;