import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

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
    const { notes } = await request.json();

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

    if (returnRequest.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'Return request is not in pending status' },
        { status: 400 }
      );
    }

    // Update return status to approved
    const updatedReturn = await prisma.return.update({
      where: { id: returnId },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: adminId
      }
    });

    // Create admin action record
    await prisma.adminAction.create({
      data: {
        returnId: returnId,
        adminId,
        action: 'return_approved',
        notes: notes || 'Return request approved'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Return approved successfully',
      data: updatedReturn
    });
  } catch (error) {
    console.error('Error approving return:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to approve return' },
      { status: 500 }
    );
  }
}
