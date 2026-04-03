/*
  Warnings:

  - You are about to drop the `_AdminActionToLoan` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[loanId]` on the table `UserRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_AdminActionToLoan";
PRAGMA foreign_keys=on;

-- CreateIndex
CREATE UNIQUE INDEX "UserRequest_loanId_key" ON "UserRequest"("loanId");
