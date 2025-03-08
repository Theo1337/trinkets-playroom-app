/*
  Warnings:

  - You are about to drop the column `formatedDate` on the `Events` table. All the data in the column will be lost.
  - Added the required column `formattedDate` to the `Events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Events" DROP COLUMN "formatedDate",
ADD COLUMN     "formattedDate" TEXT NOT NULL;
