/*
  Warnings:

  - Added the required column `baseAmount` to the `FinancialRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseCurrency` to the `FinancialRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exchangeRate` to the `FinancialRecord` table without a default value. This is not possible if the table is not empty.
  - Made the column `categoryId` on table `FinancialRecord` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "FinancialRecord" DROP CONSTRAINT "FinancialRecord_categoryId_fkey";

-- AlterTable
ALTER TABLE "FinancialRecord" ADD COLUMN     "baseAmount" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "baseCurrency" "Currency" NOT NULL,
ADD COLUMN     "exchangeRate" DECIMAL(12,6) NOT NULL,
ALTER COLUMN "categoryId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "baseCurrency" "Currency" NOT NULL DEFAULT 'USD';

-- AddForeignKey
ALTER TABLE "FinancialRecord" ADD CONSTRAINT "FinancialRecord_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinancialRecordCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
