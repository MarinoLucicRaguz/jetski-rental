/*
  Warnings:

  - The primary key for the `Location` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `location_id` on the `Location` table. All the data in the column will be lost.
  - The primary key for the `Reservation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `hasItFinished` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `isCurrentlyRunning` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `rentaloption_id` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `reservationOwner` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `reservation_id` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `reservation_location_id` on the `Reservation` table. All the data in the column will be lost.
  - Added the required column `locationId` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rentalOptionId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Jetski" DROP CONSTRAINT "Jetski_locationId_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_reservation_location_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_user_location_id_fkey";

-- DropForeignKey
ALTER TABLE "_JetskiToReservation" DROP CONSTRAINT "_JetskiToReservation_B_fkey";

-- AlterTable
ALTER TABLE "Location" DROP CONSTRAINT "Location_pkey",
DROP COLUMN "location_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Location_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_pkey",
DROP COLUMN "hasItFinished",
DROP COLUMN "isCurrentlyRunning",
DROP COLUMN "rentaloption_id",
DROP COLUMN "reservationOwner",
DROP COLUMN "reservation_id",
DROP COLUMN "reservation_location_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "locationId" INTEGER NOT NULL,
ADD COLUMN     "ownerName" TEXT,
ADD COLUMN     "rentalOptionId" INTEGER NOT NULL,
ADD COLUMN     "status" "ReservationStatus" NOT NULL DEFAULT 'PLANNED',
ALTER COLUMN "contactNumber" DROP NOT NULL,
ADD CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_user_location_id_fkey" FOREIGN KEY ("user_location_id") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jetski" ADD CONSTRAINT "Jetski_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JetskiToReservation" ADD CONSTRAINT "_JetskiToReservation_B_fkey" FOREIGN KEY ("B") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
