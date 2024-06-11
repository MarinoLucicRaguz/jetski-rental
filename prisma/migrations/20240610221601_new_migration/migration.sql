/*
  Warnings:

  - The values [EMPLOYED,VACATION,NOT_EMPLOYED] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ACTIVE', 'INACTIVE');
ALTER TABLE "User" ALTER COLUMN "user_status" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "user_status" TYPE "UserStatus_new" USING ("user_status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "UserStatus_old";
ALTER TABLE "User" ALTER COLUMN "user_status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "location_manager_id" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "user_status" SET DEFAULT 'ACTIVE';

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_location_manager_id_fkey" FOREIGN KEY ("location_manager_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
