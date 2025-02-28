-- CreateTable
CREATE TABLE "Counters" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(0) NOT NULL,
    "daily" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "Counters_pkey" PRIMARY KEY ("id")
);
