/*
  Warnings:

  - The values [SUPPORT,ANALYTICS] on the enum `ProjectDomain` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProjectDomain_new" AS ENUM ('FINANCE', 'DASHBOARD');
ALTER TABLE "ProjectPermission" ALTER COLUMN "domain" TYPE "ProjectDomain_new" USING ("domain"::text::"ProjectDomain_new");
ALTER TABLE "InvitationProjectDomain" ALTER COLUMN "domain" TYPE "ProjectDomain_new" USING ("domain"::text::"ProjectDomain_new");
ALTER TYPE "ProjectDomain" RENAME TO "ProjectDomain_old";
ALTER TYPE "ProjectDomain_new" RENAME TO "ProjectDomain";
DROP TYPE "public"."ProjectDomain_old";
COMMIT;
