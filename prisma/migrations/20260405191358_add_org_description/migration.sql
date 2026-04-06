-- AlterEnum
ALTER TYPE "InvitationStatus" ADD VALUE 'REVOKED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OtpPurpose" ADD VALUE 'DELETE_ORGANIZATION';
ALTER TYPE "OtpPurpose" ADD VALUE 'DELETE_PROJECT';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "description" TEXT;
