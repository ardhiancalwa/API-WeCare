/*
  Warnings:

  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `identityDocument` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastPaymentImage` on the `User` table. All the data in the column will be lost.
  - Added the required column `kecamatan` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kodepos` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kota` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provinsi` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BPJS', 'NON_BPJS', 'NON_ACTIVE_BPJS', 'HOSPITAL_ADMIN');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "address",
DROP COLUMN "identityDocument",
DROP COLUMN "lastPaymentImage",
ADD COLUMN     "kecamatan" TEXT NOT NULL,
ADD COLUMN     "kodepos" TEXT NOT NULL,
ADD COLUMN     "kota" TEXT NOT NULL,
ADD COLUMN     "nik" TEXT,
ADD COLUMN     "provinsi" TEXT NOT NULL,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'NON_BPJS';
