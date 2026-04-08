/*
  Warnings:

  - The values [OWNER,ANALYST,VIEWER] on the enum `ProjectRole` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `addedById` to the `ProjectMember` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectDomain" AS ENUM ('FINANCE', 'SUPPORT', 'ANALYTICS');

-- CreateEnum
CREATE TYPE "DomainAccess" AS ENUM ('READ', 'WRITE', 'MANAGE');

-- AlterEnum
BEGIN;
CREATE TYPE "ProjectRole_new" AS ENUM ('ADMIN', 'MEMBER');
ALTER TABLE "public"."InvitationProject" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."ProjectMember" ALTER COLUMN "projectRole" DROP DEFAULT;
ALTER TABLE "ProjectMember" ALTER COLUMN "projectRole" TYPE "ProjectRole_new" USING ("projectRole"::text::"ProjectRole_new");
ALTER TABLE "InvitationProject" ALTER COLUMN "role" TYPE "ProjectRole_new" USING ("role"::text::"ProjectRole_new");
ALTER TYPE "ProjectRole" RENAME TO "ProjectRole_old";
ALTER TYPE "ProjectRole_new" RENAME TO "ProjectRole";
DROP TYPE "public"."ProjectRole_old";
ALTER TABLE "InvitationProject" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
ALTER TABLE "ProjectMember" ALTER COLUMN "projectRole" SET DEFAULT 'MEMBER';
COMMIT;

-- AlterTable
ALTER TABLE "InvitationProject" ALTER COLUMN "role" SET DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "ProjectMember" ADD COLUMN     "addedById" TEXT NOT NULL,
ALTER COLUMN "projectRole" SET DEFAULT 'MEMBER';

-- CreateTable
CREATE TABLE "ProjectPermission" (
    "id" TEXT NOT NULL,
    "projectMemberId" TEXT NOT NULL,
    "domain" "ProjectDomain" NOT NULL,
    "accessLevel" "DomainAccess" NOT NULL,

    CONSTRAINT "ProjectPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationProjectDomain" (
    "id" TEXT NOT NULL,
    "invitationProjectId" TEXT NOT NULL,
    "domain" "ProjectDomain" NOT NULL,
    "accessLevel" "DomainAccess" NOT NULL,

    CONSTRAINT "InvitationProjectDomain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectPermission_projectMemberId_domain_key" ON "ProjectPermission"("projectMemberId", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationProjectDomain_invitationProjectId_domain_key" ON "InvitationProjectDomain"("invitationProjectId", "domain");

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPermission" ADD CONSTRAINT "ProjectPermission_projectMemberId_fkey" FOREIGN KEY ("projectMemberId") REFERENCES "ProjectMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationProjectDomain" ADD CONSTRAINT "InvitationProjectDomain_invitationProjectId_fkey" FOREIGN KEY ("invitationProjectId") REFERENCES "InvitationProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
