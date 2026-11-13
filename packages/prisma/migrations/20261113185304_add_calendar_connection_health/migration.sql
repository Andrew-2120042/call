-- CreateTable
CREATE TABLE "public"."CalendarConnectionHealth" (
    "id" SERIAL NOT NULL,
    "credentialId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "healthy" BOOLEAN NOT NULL DEFAULT true,
    "lastError" TEXT,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "checkedAt" TIMESTAMP(3) NOT NULL,
    "brokenSince" TIMESTAMP(3),
    "alertSentAt" TIMESTAMP(3),

    CONSTRAINT "CalendarConnectionHealth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarConnectionHealth_credentialId_key" ON "public"."CalendarConnectionHealth"("credentialId");

-- CreateIndex
CREATE INDEX "CalendarConnectionHealth_userId_healthy_idx" ON "public"."CalendarConnectionHealth"("userId", "healthy");

-- CreateIndex
CREATE INDEX "CalendarConnectionHealth_checkedAt_idx" ON "public"."CalendarConnectionHealth"("checkedAt");

-- AddForeignKey
ALTER TABLE "public"."CalendarConnectionHealth" ADD CONSTRAINT "CalendarConnectionHealth_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "public"."Credential"("id") ON DELETE CASCADE ON UPDATE CASCADE;
