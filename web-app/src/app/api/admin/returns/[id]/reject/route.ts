import { NextRequest, NextResponse } from 'next/server';
import { AdminActionType, ReturnStatus } from '@prisma/client';
import { ZodError } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sanitizeInput } from '@/lib/sanitize';
import { adminNotesSchema } from '@/lib/validations';

// PUT /api/admin/returns/:id/reject - Reject a return request and reopen loan state
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const adminId = Number.parseInt(authResult.sub!, 10);
    const resolvedParams = await params;
    const returnId = Number.parseInt(resolvedParams.id, 10);

    const body = await request.json();
    const validatedData = adminNotesSchema.parse(body);
    const { notes } = validatedData;
    const trimmedNotes = notes?.trim();
    if (!trimmedNotes) {
      return NextResponse.json(
        { success: false, message: 'Rejection reason is required' },
        { status: 400 }
      );
    }
    const sanitizedNotes = sanitizeInput(trimmedNotes);

    const returnRequest = await prisma.return.findUnique({
      where: { id: returnId }
    });

    if (!returnRequest) {
      return NextResponse.json(
        { success: false, message: 'Return request not found' },
        { status: 404 }
      );
    }

    if (returnRequest.status !== ReturnStatus.pending) {
      return NextResponse.json(
        { success: false, message: 'Only pending return requests can be rejected' },
        { status: 400 }
      );
    }

    const deletedReturn = await prisma.$transaction(async (tx) => {
      const removedReturn = await tx.return.delete({
        where: { id: returnId }
      });

      await tx.adminAction.create({
        data: {
          adminId,
          loanId: removedReturn.loanId,
          action: AdminActionType.return_rejected,
          notes: sanitizedNotes
        }
      });

      return removedReturn;
    });

    return NextResponse.json({
      success: true,
      message: 'Return request rejected successfully',
      data: deletedReturn
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

    console.error('Error rejecting return request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reject return request' },
      { status: 500 }
    );
  }
}
