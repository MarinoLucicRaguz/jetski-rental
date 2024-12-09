/*
  Warnings:

  - The primary key for the `Jetski` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `jetski_id` on the `Jetski` table. All the data in the column will be lost.
  - You are about to drop the column `jetski_kW` on the `Jetski` table. All the data in the column will be lost.
  - You are about to drop the column `jetski_location_id` on the `Jetski` table. All the data in the column will be lost.
  - You are about to drop the column `jetski_manufacturingYear` on the `Jetski` table. All the data in the column will be lost.
  - You are about to drop the column `jetski_model` on the `Jetski` table. All the data in the column will be lost.
  - You are about to drop the column `jetski_registration` on the `Jetski` table. All the data in the column will be lost.
  - You are about to drop the column `jetski_status` on the `Jetski` table. All the data in the column will be lost.
  - You are about to drop the column `jetski_topSpeed` on the `Jetski` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[registration]` on the table `Jetski` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `manufacturingYear` to the `Jetski` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Jetski` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registration` to the `Jetski` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topSpeed` to the `Jetski` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Jetski" DROP CONSTRAINT "Jetski_jetski_location_id_fkey";

-- DropForeignKey
ALTER TABLE "_JetskiToReservation" DROP CONSTRAINT "_JetskiToReservation_A_fkey";

-- DropIndex
DROP INDEX "Jetski_jetski_registration_key";

-- AlterTable
ALTER TABLE "Jetski" DROP CONSTRAINT "Jetski_pkey",
DROP COLUMN "jetski_id",
DROP COLUMN "jetski_kW",
DROP COLUMN "jetski_location_id",
DROP COLUMN "jetski_manufacturingYear",
DROP COLUMN "jetski_model",
DROP COLUMN "jetski_registration",
DROP COLUMN "jetski_status",
DROP COLUMN "jetski_topSpeed",
ADD COLUMN     "enginePower" INTEGER,
ADD COLUMN     "fuelCapacity" DECIMAL(65,30),
ADD COLUMN     "fuelConsumption" DECIMAL(65,30),
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "locationId" INTEGER,
ADD COLUMN     "manufacturingYear" INTEGER NOT NULL,
ADD COLUMN     "model" TEXT NOT NULL,
ADD COLUMN     "peopleCapacity" INTEGER,
ADD COLUMN     "registration" TEXT NOT NULL,
ADD COLUMN     "status" "JetskiStatus" NOT NULL DEFAULT 'AVAILABLE',
ADD COLUMN     "topSpeed" TEXT NOT NULL,
ADD CONSTRAINT "Jetski_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Jetski_registration_key" ON "Jetski"("registration");

-- AddForeignKey
ALTER TABLE "Jetski" ADD CONSTRAINT "Jetski_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("location_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JetskiToReservation" ADD CONSTRAINT "_JetskiToReservation_A_fkey" FOREIGN KEY ("A") REFERENCES "Jetski"("id") ON DELETE CASCADE ON UPDATE CASCADE;
