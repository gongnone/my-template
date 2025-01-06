import { loadStripe } from '@stripe/stripe-js';

// Add debug logs
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
console.log('Initializing Stripe with key:', stripeKey ? `${stripeKey.slice(0, 8)}...` : 'MISSING');

export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.error('Stripe publishable key is missing!');
    throw new Error('Stripe publishable key is missing');
  }
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}; 