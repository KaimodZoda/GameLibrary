import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/returns/:id/approve - Approve a return request
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || (token as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const adminId = parseInt(token.sub!);
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
        requestId: returnId,
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
