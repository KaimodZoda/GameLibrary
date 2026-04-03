/*
  Warnings:

  - You are about to drop the `UserRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `dateBorrowed` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `returnApprovedAt` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `returnedAt` on the `Loan` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UserRequest_loanId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserRequest";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Return" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "loanId" INTEGER NOT NULL,
    "requestedReturnDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimatedReturnDate" DATETIME,
    "returnMethod" TEXT,
    "trackingNumber" TEXT,
    "returnNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Return_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Return_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Return_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdminAction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestId" INTEGER NOT NULL,
    "adminId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "actionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdminAction_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Return" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AdminAction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AdminAction" ("action", "actionDate", "adminId", "createdAt", "id", "notes", "requestId", "updatedAt") SELECT "action", "actionDate", "adminId", "createdAt", "id", "notes", "requestId", "updatedAt" FROM "AdminAction";
DROP TABLE "AdminAction";
ALTER TABLE "new_AdminAction" RENAME TO "AdminAction";
CREATE TABLE "new_Loan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "dateRequested" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME NOT NULL,
    "approvedAt" DATETIME,
    "approvedBy" INTEGER,
    "returnApprovedBy" INTEGER,
    "pickupDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Loan_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Loan_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Loan_returnApprovedBy_fkey" FOREIGN KEY ("returnApprovedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Loan" ("approvedAt", "approvedBy", "createdAt", "dueDate", "gameId", "id", "returnApprovedBy", "updatedAt", "userId") SELECT "approvedAt", "approvedBy", "createdAt", "dueDate", "gameId", "id", "returnApprovedBy", "updatedAt", "userId" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
CREATE UNIQUE INDEX "Loan_userId_gameId_dateRequested_key" ON "Loan"("userId", "gameId", "dateRequested");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Return_loanId_key" ON "Return"("loanId");
