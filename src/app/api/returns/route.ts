import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Get all returns and filter by userId if needed
    const allReturns = await prisma.return.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    let returns = allReturns;
    
    if (userId) {
      // Filter returns for specific user by checking their loans
      const userLoans = await prisma.loan.findMany({
        where: { userId: parseInt(userId) },
        select: { id: true }
      });
      
      const userLoanIds = userLoans.map(loan => loan.id);
      returns = allReturns.filter(return_ => userLoanIds.includes(return_.loanId));
    }

    return NextResponse.json(returns);
  } catch (error) {
    console.error('Error fetching returns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch returns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loanId, returnMethod, trackingNumber, returnNotes, estimatedReturnDate } = body;

    if (!loanId) {
      return NextResponse.json(
        { error: 'Loan ID is required' },
        { status: 400 }
      );
    }

    // Check if return request already exists for this loan
    const existingReturn = await prisma.return.findFirst({
      where: { loanId: parseInt(loanId) }
    });

    if (existingReturn) {
      return NextResponse.json(
        { error: 'Return request already exists for this loan' },
        { status: 400 }
      );
    }

    // Create new return request
    const newReturn = await prisma.return.create({
      data: {
        loanId: parseInt(loanId),
        returnMethod,
        trackingNumber,
        returnNotes,
        estimatedReturnDate: estimatedReturnDate ? new Date(estimatedReturnDate) : null
      }
    });

    return NextResponse.json(newReturn, { status: 201 });
  } catch (error) {
    console.error('Error creating return request:', error);
    return NextResponse.json(
      { error: 'Failed to create return request' },
      { status: 500 }
    );
  }
}
