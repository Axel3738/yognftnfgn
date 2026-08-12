import { PrismaClient } from "@prisma/client";

/** Vite hot-reload skulle annars skapa en ny pool per omladdning. */
declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const prisma = global.prismaGlobal ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prismaGlobal = prisma;

export default prisma;
