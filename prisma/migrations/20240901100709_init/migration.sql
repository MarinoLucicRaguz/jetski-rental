/*
  Warnings:

  - The `jetski_status` column on the `Jetski` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[contactNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RentalOptionType" AS ENUM ('SAFARI', 'REGULAR_TOUR');

-- CreateEnum
CREATE TYPE "JetskiStatus" AS ENUM ('AVAILABLE', 'NOT_AVAILABLE', 'NOT_IN_FLEET');

-- AlterTable
ALTER TABLE "Jetski" DROP COLUMN "jetski_status",
ADD COLUMN     "jetski_status" "JetskiStatus" NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "isActive" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "hasItFinished" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "contactNumber" TEXT;

-- DropEnum
DROP TYPE "rentalOptionType";

-- DropEnum
DROP TYPE "statusJetski";

-- CreateIndex
CREATE UNIQUE INDEX "User_contactNumber_key" ON "User"("contactNumber");
