-- AlterTable
ALTER TABLE "Loan" ADD COLUMN "completedAt" DATETIME;

-- AlterTable
ALTER TABLE "Return" ADD COLUMN "approvedAt" DATETIME;
ALTER TABLE "Return" ADD COLUMN "completedAt" DATETIME;
