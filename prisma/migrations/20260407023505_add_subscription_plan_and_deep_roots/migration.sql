-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('SEEDLING', 'DEEP_ROOTS');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isDeepRoots" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "plan" "SubscriptionPlan";
