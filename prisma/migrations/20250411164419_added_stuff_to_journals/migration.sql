/*
  Warnings:

  - You are about to drop the column `passwordProtected` on the `Journals` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Journals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Journals" DROP COLUMN "passwordProtected",
DROP COLUMN "text",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "isPasswordProtected" BOOLEAN NOT NULL DEFAULT false;
