-- CreateTable
CREATE TABLE "Movies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movies_pkey" PRIMARY KEY ("id")
);
