-- AlterTable
ALTER TABLE "Loan" ADD COLUMN "completedBy" INTEGER;

-- AlterTable
ALTER TABLE "Return" ADD COLUMN "approvedBy" INTEGER;
ALTER TABLE "Return" ADD COLUMN "completedBy" INTEGER;
