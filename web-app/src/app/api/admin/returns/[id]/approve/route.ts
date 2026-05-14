import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { AdminActionType, ReturnStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { adminNotesSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { sanitizeInput } from '@/lib/sanitize';

// PUT /api/admin/returns/:id/approve - Approve a return request
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
    const returnId = parseInt(resolvedParams.id);

    // Validate request body
    const body = await request.json();
    const validatedData = adminNotesSchema.parse(body);
    const { notes } = validatedData;

    // Sanitize notes to prevent XSS
    const sanitizedNotes = notes ? sanitizeInput(notes) : undefined;

    // Check if return request exists and is pending
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
        { success: false, message: 'Return request is not in pending status' },
        { status: 400 }
      );
    }

    // Update return status to approved
    const updatedReturn = await prisma.return.update({
      where: { id: returnId },
      data: {
        status: ReturnStatus.approved,
        approvedAt: new Date(),
        approvedBy: adminId
      }
    });

    // Create admin action record
    await prisma.adminAction.create({
      data: {
        adminId,
        returnId,
        action: AdminActionType.return_approved,
        notes: sanitizedNotes || 'Return request approved'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Return approved successfully',
      data: updatedReturn
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
    console.error('Error approving return:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to approve return' },
      { status: 500 }
    );
  }
}
