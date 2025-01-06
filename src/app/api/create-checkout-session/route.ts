import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { priceId, userId } = await req.json();
    
    console.log('Creating checkout session with:', { priceId, userId });

    if (!priceId || !userId) {
      throw new Error('Missing required fields');
    }

    // Determine plan type from price ID
    const planType = priceId.includes('pro') ? 'PRO' : 'AGENCY';

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: {
        userId,
        planType,
      },
      customer_email: undefined,
    });

    console.log('Checkout session created:', session.id);

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating checkout session' },
      { status: 500 }
    );
  }
} 