-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Loan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "dateBorrowed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateRequested" DATETIME,
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
INSERT INTO "new_Loan" ("approvedAt", "approvedBy", "createdAt", "dateRequested", "dueDate", "gameId", "id", "pickupDate", "returnApprovedBy", "status", "updatedAt", "userId") SELECT "approvedAt", "approvedBy", "createdAt", "dateRequested", "dueDate", "gameId", "id", "pickupDate", "returnApprovedBy", "status", "updatedAt", "userId" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
CREATE UNIQUE INDEX "Loan_userId_gameId_dateBorrowed_key" ON "Loan"("userId", "gameId", "dateBorrowed");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
