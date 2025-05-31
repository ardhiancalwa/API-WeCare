-- CreateTable
CREATE TABLE "Hospital" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "provinsi" TEXT NOT NULL,
    "kota" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "kodepos" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_phone_key" ON "Hospital"("phone");
