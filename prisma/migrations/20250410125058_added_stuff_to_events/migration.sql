/*
  Warnings:

  - You are about to drop the column `formattedDate` on the `Events` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Events" DROP COLUMN "formattedDate",
DROP COLUMN "text",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "heart" BOOLEAN NOT NULL DEFAULT false;
