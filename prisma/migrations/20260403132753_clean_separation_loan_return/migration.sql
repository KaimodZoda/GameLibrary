/*
  Warnings:

  - You are about to drop the column `approvedAt` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `dateRequested` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `returnApprovedBy` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `gameId` on the `Return` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Return` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Loan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "dateBorrowed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME NOT NULL,
    "approvedBy" INTEGER,
    "pickupDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Loan_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Loan_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Loan" ("approvedBy", "createdAt", "dateBorrowed", "dueDate", "gameId", "id", "pickupDate", "status", "updatedAt", "userId") SELECT "approvedBy", "createdAt", "dateBorrowed", "dueDate", "gameId", "id", "pickupDate", "status", "updatedAt", "userId" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
CREATE UNIQUE INDEX "Loan_userId_gameId_dateBorrowed_key" ON "Loan"("userId", "gameId", "dateBorrowed");
CREATE TABLE "new_Return" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "loanId" INTEGER NOT NULL,
    "requestedReturnDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimatedReturnDate" DATETIME,
    "returnMethod" TEXT,
    "trackingNumber" TEXT,
    "returnNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Return" ("createdAt", "estimatedReturnDate", "id", "loanId", "requestedReturnDate", "returnMethod", "returnNotes", "status", "trackingNumber", "updatedAt") SELECT "createdAt", "estimatedReturnDate", "id", "loanId", "requestedReturnDate", "returnMethod", "returnNotes", "status", "trackingNumber", "updatedAt" FROM "Return";
DROP TABLE "Return";
ALTER TABLE "new_Return" RENAME TO "Return";
CREATE UNIQUE INDEX "Return_loanId_key" ON "Return"("loanId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
