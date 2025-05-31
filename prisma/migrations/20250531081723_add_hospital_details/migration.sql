/*
  Warnings:

  - Added the required column `closeTime` to the `Hospital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openTime` to the `Hospital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Hospital` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "closeTime" TEXT NOT NULL,
ADD COLUMN     "holidays" TIMESTAMP(3)[],
ADD COLUMN     "offDays" TEXT[],
ADD COLUMN     "openTime" TEXT NOT NULL,
ADD COLUMN     "services" TEXT[],
ADD COLUMN     "type" TEXT NOT NULL;
