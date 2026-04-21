/*
  Warnings:

  - A unique constraint covering the columns `[date,id]` on the table `FinancialRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "FinancialRecord_projectId_date_id_idx" ON "FinancialRecord"("projectId", "date", "id");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialRecord_date_id_key" ON "FinancialRecord"("date", "id");
