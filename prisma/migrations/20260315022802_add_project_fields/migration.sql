/*
  Warnings:

  - Made the column `description` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "detailedDescription" TEXT,
ADD COLUMN     "domainName" TEXT,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "liveUrl" TEXT,
ALTER COLUMN "description" SET NOT NULL;
