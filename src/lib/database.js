import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export const prisma = new PrismaClient().$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
