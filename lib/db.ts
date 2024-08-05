import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
}

export const db = new PrismaClient();

//u normalnoj situaciji samo bi bilo PrismaClient(), ali ovo je zato sto smo u produkciji, pa ne zelimo da se stalno stvaraju
//export const db= new PrismaClient()

// export const db = globalThis.prisma || new PrismaClient();

// if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

// //u normalnoj situaciji samo bi bilo PrismaClient(), ali ovo je zato sto smo u produkciji, pa ne zelimo da se stalno stvaraju
// //export const db= new PrismaClient()

