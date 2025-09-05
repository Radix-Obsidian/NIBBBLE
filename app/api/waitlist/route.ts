import { NextRequest, NextResponse } from 'next/server';
import { WaitlistService } from '@/lib/waitlist';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type, name, ...additionalData } = body;

    // Validate required fields
    if (!email || !type || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, type, name' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['creator', 'cooker'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "creator" or "cooker"' },
        { status: 400 }
      );
    }

    // Check if already on waitlist
    const existingEntry = await WaitlistService.getEntryByEmail(email);
    if (existingEntry) {
      return NextResponse.json(
        { error: 'Email already on waitlist', status: existingEntry.status },
        { status: 409 }
      );
    }

    // Add to waitlist
    const entry = await WaitlistService.addEntry({
      email: email.toLowerCase(),
      type,
      name,
      ...additionalData
    });

    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        email: entry.email,
        type: entry.type,
        status: entry.status,
        submittedAt: entry.submittedAt
      }
    });

  } catch (error) {
    console.error('Waitlist submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (email) {
      // Check specific email status
      const status = await WaitlistService.getWaitlistStatus(email);
      return NextResponse.json({ email, status });
    } else {
      // Return all entries (admin only in production)
      const entries = await WaitlistService.getAllEntries();
      return NextResponse.json({ entries });
    }
  } catch (error) {
    console.error('Waitlist query error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, status } = body;

    if (!email || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: email, status' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    let success = false;
    if (status === 'approved') {
      success = await WaitlistService.approveEntry(email);
    } else if (status === 'rejected') {
      success = await WaitlistService.rejectEntry(email);
    }

    if (success) {
      return NextResponse.json({ success: true, email, status });
    } else {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Waitlist update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
