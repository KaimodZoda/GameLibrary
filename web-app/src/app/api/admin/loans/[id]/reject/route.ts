import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { adminNotesSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { sanitizeInput } from '@/lib/sanitize';

// PUT /api/admin/loans/:id/reject - Reject a loan request
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

    // Check if loan exists and is pending
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { game: true }
    });

    if (!loan) {
      return NextResponse.json(
        { success: false, message: 'Loan not found' },
        { status: 404 }
      );
    }

    if (loan.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'Only pending loans can be rejected' },
        { status: 400 }
      );
    }

    // Update loan status to rejected
    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: 'rejected',
        completedBy: adminId,
        completedAt: new Date()
      }
    });

    // Restore game availability
    if (!loan.game.available) {
      await prisma.game.update({
        where: { id: loan.gameId },
        data: { available: true }
      });
    }

    // Create admin action record
    await prisma.adminAction.create({
      data: {
        adminId,
        loanId,
        action: 'loan_rejected',
        notes: sanitizedNotes || 'Loan request rejected'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Loan request rejected successfully'
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
    console.error('Error rejecting loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reject loan request' },
      { status: 500 }
    );
  }
}
