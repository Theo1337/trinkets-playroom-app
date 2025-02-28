-- CreateTable
CREATE TABLE "Quotes" (
    "id" SERIAL NOT NULL,
    "quote" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "date" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "Quotes_pkey" PRIMARY KEY ("id")
);
