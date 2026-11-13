-- CreateEnum
CREATE TYPE "public"."SlotwisePlan" AS ENUM ('FREE', 'PRO', 'TEAM');

-- CreateTable
CREATE TABLE "public"."PlanSubscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "plan" "public"."SlotwisePlan" NOT NULL,
    "status" TEXT NOT NULL,
    "polarSubscriptionId" TEXT NOT NULL,
    "polarCustomerId" TEXT NOT NULL,
    "polarProductId" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "polarModifiedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanSubscription_userId_key" ON "public"."PlanSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanSubscription_polarSubscriptionId_key" ON "public"."PlanSubscription"("polarSubscriptionId");

-- AddForeignKey
ALTER TABLE "public"."PlanSubscription" ADD CONSTRAINT "PlanSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
