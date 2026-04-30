import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { adminNotesSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { sanitizeInput } from '@/lib/sanitize';

// PUT /api/admin/loans/:id/pickup - Confirm user pickup
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const adminId = parseInt(authResult.sub!);
    const resolvedParams = await params;
    const loanId = parseInt(resolvedParams.id);

    // Validate request body
    const body = await request.json();
    const validatedData = adminNotesSchema.parse(body);
    const { notes } = validatedData;

    // Sanitize notes to prevent XSS
    const sanitizedNotes = notes ? sanitizeInput(notes) : undefined;

    // Check if loan exists and is approved
    const loan = await prisma.loan.findUnique({
      where: { id: loanId }
    });

    if (!loan) {
      return NextResponse.json(
        { success: false, message: 'Loan not found' },
        { status: 404 }
      );
    }

    if (loan.status !== 'approved') {
      return NextResponse.json(
        { success: false, message: 'Loan is not in approved status' },
        { status: 400 }
      );
    }

    // Update loan status to completed and add pickup date
    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: 'completed',
        pickupDate: new Date(),
        completedBy: adminId
      }
    });

    // Create admin action record
    await prisma.adminAction.create({
      data: {
        adminId,
        loanId,
        action: 'loan_picked_up',
        notes: sanitizedNotes || 'User pickup confirmed'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Pickup confirmed successfully',
      data: updatedLoan
    });
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
    console.error('Error confirming pickup:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to confirm pickup' },
      { status: 500 }
    );
  }
}
