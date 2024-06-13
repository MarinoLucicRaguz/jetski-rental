/*
  Warnings:

  - A unique constraint covering the columns `[location_manager_id]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "isCurrentlyRunning" BOOLEAN DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Location_location_manager_id_key" ON "Location"("location_manager_id");
