import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, getUserId, isAdmin } from '@/lib/auth';
import { createReturnSchema } from '@/lib/validations';
import { toPrismaReturnMethod, toPublicReturnMethod } from '@/lib/return-method';
import { ZodError } from 'zod';
import { sanitizeInput } from '@/lib/sanitize';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Get all returns and filter by userId if needed
    const allReturns = await prisma.return.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    let returns = allReturns;
    
    // Only allow filtering by authenticated user's ID for non-admins
    if (userId && !isAdmin(authResult)) {
      const currentUserId = getUserId(authResult);
      if (parseInt(userId) !== currentUserId) {
        return NextResponse.json(
          { success: false, message: 'Access denied' },
          { status: 403 }
        );
      }
    }
    
    if (userId) {
      // Filter returns for specific user by checking their loans
      const userLoans = await prisma.loan.findMany({
        where: { userId: parseInt(userId) },
        select: { id: true }
      });
      
      const userLoanIds = userLoans.map(loan => loan.id);
      returns = allReturns.filter(return_ => userLoanIds.includes(return_.loanId));
    }

    return NextResponse.json(
      returns.map((returnRequest) => ({
        ...returnRequest,
        returnMethod: toPublicReturnMethod(returnRequest.returnMethod)
      }))
    );
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

    // Validate request body
    const validatedData = createReturnSchema.parse(body);
    const { loanId, returnMethod, trackingNumber, returnNotes, estimatedReturnDate } = validatedData;

    // Sanitize returnNotes to prevent XSS
    const sanitizedReturnNotes = returnNotes ? sanitizeInput(returnNotes) : undefined;

    // Check if return request already exists for this loan
    const existingReturn = await prisma.return.findFirst({
      where: { loanId }
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
        loanId,
        returnMethod: toPrismaReturnMethod(returnMethod),
        trackingNumber,
        returnNotes: sanitizedReturnNotes,
        estimatedReturnDate: estimatedReturnDate ? new Date(estimatedReturnDate) : null
      }
    });

    return NextResponse.json({
      ...newReturn,
      returnMethod: toPublicReturnMethod(newReturn.returnMethod)
    }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.issues
        },
        { status: 400 }
      );
    }
    console.error('Error creating return request:', error);
    return NextResponse.json(
      { error: 'Failed to create return request' },
      { status: 500 }
    );
  }
}
