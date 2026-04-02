-- CreateTable
CREATE TABLE "UserRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'pending',
    "requestedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedPickupDate" DATETIME,
    "estimatedReturnDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "loanId" INTEGER,
    CONSTRAINT "UserRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserRequest_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserRequest_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminAction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestId" INTEGER NOT NULL,
    "adminId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "actionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdminAction_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "UserRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AdminAction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AdminActionToLoan" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_AdminActionToLoan_A_fkey" FOREIGN KEY ("A") REFERENCES "AdminAction" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AdminActionToLoan_B_fkey" FOREIGN KEY ("B") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_AdminActionToLoan_AB_unique" ON "_AdminActionToLoan"("A", "B");

-- CreateIndex
CREATE INDEX "_AdminActionToLoan_B_index" ON "_AdminActionToLoan"("B");
