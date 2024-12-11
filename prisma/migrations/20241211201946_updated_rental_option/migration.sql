/*
  Warnings:

  - You are about to drop the `RentalOptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "RentalOptions";

-- CreateTable
CREATE TABLE "RentalOption" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RentalOption_pkey" PRIMARY KEY ("id")
);
