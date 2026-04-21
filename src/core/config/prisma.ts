import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client";

// let prisma : PrismaClient = new PrismaClient();
console.log("Prisma Database url",process.env.DATABASE_URL?.substring(0, 4) + "...");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
// const prisma = new Prisma()
export default prisma;
