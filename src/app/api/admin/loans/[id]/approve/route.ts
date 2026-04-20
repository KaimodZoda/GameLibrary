import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// PUT /api/admin/loans/:id/approve - Approve a loan request
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
    const { notes } = await request.json();

    // Check if loan exists and is pending
    const loan = await prisma.loan.findUnique({
      where: { id: loanId }
    });

    if (!loan) {
      return NextResponse.json(
        { success: false, message: 'Loan not found' },
        { status: 404 }
      );
    }

    if (loan.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'Loan is not in pending status' },
        { status: 400 }
      );
    }

    // Update loan status to approved
    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: adminId
      }
    });

    // Create admin action record for loan approval
    await prisma.adminAction.create({
      data: {
        loanId: loanId,
        adminId,
        action: 'loan_approved',
        notes: notes || 'Loan request approved'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Loan approved successfully',
      data: updatedLoan
    });
  } catch (error) {
    console.error('Error approving loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to approve loan' },
      { status: 500 }
    );
  }
}
