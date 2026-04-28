import { writeFileSync } from "fs";
import { swaggerSpec } from "../src/core/config/swagger";

writeFileSync("public/swagger.json", JSON.stringify(swaggerSpec, null, 2));
console.log("Swagger spec generated at public/swagger.json");