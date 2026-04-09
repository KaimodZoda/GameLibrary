/*
  Warnings:

  - You are about to drop the `AdminAction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AdminAction";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "admin_actions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "loanId" INTEGER,
    "returnId" INTEGER,
    "adminId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "actionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "admin_actions_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "admin_actions_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "Return" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "admin_actions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
