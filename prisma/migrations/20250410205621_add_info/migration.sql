-- CreateTable
CREATE TABLE "Info" (
    "id" SERIAL NOT NULL,
    "firstDayOfSem" TIMESTAMP(3),
    "lastDayOfSem" TIMESTAMP(3),
    "semester" TEXT,

    CONSTRAINT "Info_pkey" PRIMARY KEY ("id")
);
