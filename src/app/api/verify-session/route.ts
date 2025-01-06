import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      // Here you would typically:
      // 1. Update user's subscription status in your database
      // 2. Grant access to paid features
      // 3. Send welcome email, etc.
      
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false });
    }
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json(
      { success: false, error: 'Error verifying session' },
      { status: 500 }
    );
  }
} 