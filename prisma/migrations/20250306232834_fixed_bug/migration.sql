/*
  Warnings:

  - Added the required column `createdAt` to the `Events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "createdAt" TIMESTAMP(0) NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TEXT;
