-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "RecordSource" AS ENUM ('CASH', 'BANK', 'UPI', 'CARD', 'WALLET');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('INR', 'USD', 'EUR');

-- CreateTable
CREATE TABLE "FinancialRecord" (
    "id" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "RecordType" NOT NULL,
    "categoryId" TEXT,
    "source" "RecordSource",
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FinancialRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialRecordCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RecordType" NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialRecordCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialRecordTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialRecordTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialRecordTagMap" (
    "recordId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "FinancialRecordTagMap_pkey" PRIMARY KEY ("recordId","tagId")
);

-- CreateIndex
CREATE INDEX "FinancialRecord_createdByUserId_idx" ON "FinancialRecord"("createdByUserId");

-- CreateIndex
CREATE INDEX "FinancialRecord_projectId_idx" ON "FinancialRecord"("projectId");

-- CreateIndex
CREATE INDEX "FinancialRecord_date_idx" ON "FinancialRecord"("date");

-- CreateIndex
CREATE INDEX "FinancialRecord_type_idx" ON "FinancialRecord"("type");

-- CreateIndex
CREATE INDEX "FinancialRecord_categoryId_idx" ON "FinancialRecord"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialRecordCategory_name_projectId_key" ON "FinancialRecordCategory"("name", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialRecordTag_name_projectId_key" ON "FinancialRecordTag"("name", "projectId");

-- AddForeignKey
ALTER TABLE "FinancialRecord" ADD CONSTRAINT "FinancialRecord_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialRecord" ADD CONSTRAINT "FinancialRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialRecord" ADD CONSTRAINT "FinancialRecord_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinancialRecordCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialRecordCategory" ADD CONSTRAINT "FinancialRecordCategory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialRecordTag" ADD CONSTRAINT "FinancialRecordTag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialRecordTagMap" ADD CONSTRAINT "FinancialRecordTagMap_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "FinancialRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialRecordTagMap" ADD CONSTRAINT "FinancialRecordTagMap_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "FinancialRecordTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
