DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReturnMethod') THEN
    CREATE TYPE "ReturnMethod" AS ENUM ('in-person', 'drop-box', 'shipping', 'courier');
  END IF;
END
$$;

ALTER TABLE "Return"
  ALTER COLUMN "returnMethod" TYPE "ReturnMethod"
  USING (
    CASE
      WHEN "returnMethod" IS NULL THEN NULL
      ELSE "returnMethod"::text::"ReturnMethod"
    END
  );
