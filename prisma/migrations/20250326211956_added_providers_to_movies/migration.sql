-- AlterTable
ALTER TABLE "Movies" ADD COLUMN     "providers" TEXT;

-- CreateTable
CREATE TABLE "Journals" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT,
    "passwordProtected" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "Journals_pkey" PRIMARY KEY ("id")
);
