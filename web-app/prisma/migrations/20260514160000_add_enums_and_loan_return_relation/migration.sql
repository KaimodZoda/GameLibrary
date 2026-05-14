-- Create enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LoanStatus') THEN
    CREATE TYPE "LoanStatus" AS ENUM ('pending', 'approved', 'completed', 'rejected');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReturnStatus') THEN
    CREATE TYPE "ReturnStatus" AS ENUM ('pending', 'approved', 'completed');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminActionType') THEN
    CREATE TYPE "AdminActionType" AS ENUM (
      'loan_approved',
      'loan_rejected',
      'return_approved',
      'return_rejected',
      'return_completed',
      'loan_picked_up'
    );
  END IF;
END
$$;

-- Convert existing TEXT columns to enums with explicit casts
ALTER TABLE "User"
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" TYPE "UserRole" USING ("role"::"UserRole"),
  ALTER COLUMN "role" SET DEFAULT 'USER';

ALTER TABLE "Loan"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "LoanStatus" USING ("status"::"LoanStatus"),
  ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "Return"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "ReturnStatus" USING ("status"::"ReturnStatus"),
  ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "admin_actions"
  ALTER COLUMN "action" TYPE "AdminActionType" USING ("action"::"AdminActionType");

-- Add missing Return -> Loan relation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'Return_loanId_fkey'
      AND table_name = 'Return'
  ) THEN
    ALTER TABLE "Return"
      ADD CONSTRAINT "Return_loanId_fkey"
      FOREIGN KEY ("loanId") REFERENCES "Loan"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;
END
$$;
