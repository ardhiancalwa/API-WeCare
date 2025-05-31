-- CreateTable
CREATE TABLE "PayLater" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tenor" INTEGER NOT NULL,
    "interest" DOUBLE PRECISION NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayLater_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PayLater_userId_idx" ON "PayLater"("userId");

-- AddForeignKey
ALTER TABLE "PayLater" ADD CONSTRAINT "PayLater_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
