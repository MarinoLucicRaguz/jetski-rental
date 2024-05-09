-- CreateEnum
CREATE TYPE "rentalOptionType" AS ENUM ('SAFARI', 'REGULAR_TOUR', 'NONE');

-- CreateEnum
CREATE TYPE "statusJetski" AS ENUM ('AVAILABLE', 'NOT_AVAILABLE', 'OUT_OF_FUEL', 'NOT_IN_FLEET');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('EMPLOYED', 'VACATION', 'NOT_EMPLOYED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MODERATOR', 'USER', 'GUEST');

-- CreateTable
CREATE TABLE "Location" (
    "location_id" SERIAL NOT NULL,
    "location_name" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "user_status" "UserStatus" NOT NULL DEFAULT 'EMPLOYED',
    "user_role" "UserRole" NOT NULL DEFAULT 'GUEST',
    "user_location_id" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Jetski" (
    "jetski_id" SERIAL NOT NULL,
    "jetski_registration" TEXT NOT NULL,
    "jetski_model" TEXT NOT NULL,
    "jetski_topSpeed" TEXT NOT NULL,
    "jetski_kW" TEXT NOT NULL,
    "jetski_manufacturingYear" TEXT NOT NULL,
    "jetski_status" "statusJetski" NOT NULL DEFAULT 'AVAILABLE',
    "jetski_location_id" INTEGER,

    CONSTRAINT "Jetski_pkey" PRIMARY KEY ("jetski_id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "reservation_id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reservationOwner" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "reservation_location_id" INTEGER NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("reservation_id")
);

-- CreateTable
CREATE TABLE "RentalOptions" (
    "rentaloption_id" SERIAL NOT NULL,
    "rentaloption_description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "rentalprice" DOUBLE PRECISION NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RentalOptions_pkey" PRIMARY KEY ("rentaloption_id")
);

-- CreateTable
CREATE TABLE "_JetskiToReservation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_location_name_key" ON "Location"("location_name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Jetski_jetski_registration_key" ON "Jetski"("jetski_registration");

-- CreateIndex
CREATE UNIQUE INDEX "_JetskiToReservation_AB_unique" ON "_JetskiToReservation"("A", "B");

-- CreateIndex
CREATE INDEX "_JetskiToReservation_B_index" ON "_JetskiToReservation"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_user_location_id_fkey" FOREIGN KEY ("user_location_id") REFERENCES "Location"("location_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jetski" ADD CONSTRAINT "Jetski_jetski_location_id_fkey" FOREIGN KEY ("jetski_location_id") REFERENCES "Location"("location_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_reservation_location_id_fkey" FOREIGN KEY ("reservation_location_id") REFERENCES "Location"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JetskiToReservation" ADD CONSTRAINT "_JetskiToReservation_A_fkey" FOREIGN KEY ("A") REFERENCES "Jetski"("jetski_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JetskiToReservation" ADD CONSTRAINT "_JetskiToReservation_B_fkey" FOREIGN KEY ("B") REFERENCES "Reservation"("reservation_id") ON DELETE CASCADE ON UPDATE CASCADE;
