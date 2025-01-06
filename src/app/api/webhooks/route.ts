import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Webhook event received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get the price ID from the session
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0].price?.id;
        
        // Determine plan type based on price ID
        const planType = priceId?.includes('pro') ? 'PRO' : 'AGENCY';
        
        console.log('Setting subscription:', {
          userId: session.metadata?.userId,
          planType,
          status: 'active'
        });

        // Store subscription in Firebase
        await setDoc(doc(db, 'subscriptions', session.metadata?.userId!), {
          customerId: session.customer,
          planType,
          status: 'active',
          priceId,
          createdAt: new Date().toISOString(),
        });
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        
        console.log('Updating subscription:', {
          userId: subscription.metadata?.userId,
          status
        });

        await updateDoc(doc(db, 'subscriptions', subscription.metadata?.userId!), {
          status,
          updatedAt: new Date().toISOString(),
        });
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 