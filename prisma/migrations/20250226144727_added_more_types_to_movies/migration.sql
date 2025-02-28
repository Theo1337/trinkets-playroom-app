-- AlterTable
ALTER TABLE "Movies" ADD COLUMN     "dateWatched" TIMESTAMP(0),
ADD COLUMN     "watched" BOOLEAN NOT NULL DEFAULT false;
