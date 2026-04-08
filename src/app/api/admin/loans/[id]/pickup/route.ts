import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/loans/:id/pickup - Confirm user pickup
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
    const loanId = parseInt(resolvedParams.id);
    const { notes } = await request.json();

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
        requestId: loanId,
        adminId,
        action: 'pickup_confirmed',
        notes: notes || 'User pickup confirmed'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Pickup confirmed successfully',
      data: updatedLoan
    });
  } catch (error) {
    console.error('Error confirming pickup:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to confirm pickup' },
      { status: 500 }
    );
  }
}
