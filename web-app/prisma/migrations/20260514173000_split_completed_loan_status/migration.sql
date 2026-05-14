ALTER TYPE "LoanStatus" RENAME TO "LoanStatus_old";

CREATE TYPE "LoanStatus" AS ENUM ('pending', 'approved', 'picked_up', 'returned', 'rejected');

ALTER TABLE "Loan"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "LoanStatus"
  USING (
    CASE
      WHEN "status"::text = 'completed' AND "completedAt" IS NULL THEN 'picked_up'
      WHEN "status"::text = 'completed' AND "completedAt" IS NOT NULL THEN 'returned'
      ELSE "status"::text
    END
  )::"LoanStatus",
  ALTER COLUMN "status" SET DEFAULT 'pending';

DROP TYPE "LoanStatus_old";
