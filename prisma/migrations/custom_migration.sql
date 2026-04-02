-- CreateIndex
CREATE UNIQUE INDEX one_owner_per_org ON "OrganizationMember" ("organizationId") WHERE role = 'OWNER';