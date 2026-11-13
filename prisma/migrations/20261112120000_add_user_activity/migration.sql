CREATE TABLE "UserActivity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserActivity_userId_date_key" ON "UserActivity"("userId", "date");
CREATE INDEX "UserActivity_date_idx" ON "UserActivity"("date");

ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
