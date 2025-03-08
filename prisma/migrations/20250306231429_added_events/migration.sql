-- CreateTable
CREATE TABLE "Events" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "date" TIMESTAMP(0) NOT NULL,
    "formatedDate" TEXT NOT NULL,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);
