export const PLANS = {
  AGENCY: {
    name: 'Agency Plan',
    monthly: {
      price: 397,
      priceId: process.env.NEXT_PUBLIC_STRIPE_AGENCY_MONTHLY_PRICE_ID || 'not_set'
    },
    annual: {
      price: 3297,
      priceId: process.env.NEXT_PUBLIC_STRIPE_AGENCY_ANNUAL_PRICE_ID || 'not_set'
    },
    features: [
      '8 Dream Buyer Avatars',
      'Uncover "obsessed stalker" level insights',
      'Discover Deep Seeded Buying triggers',
      '16 Long Form Facebook Ads',
      '200+ Facebook Ad Headlines',
      '30 High CTR Link Descriptions',
      '2000+ Ad combinations',
      '24 Direct Response Headline Sets'
    ]
  },
  PRO: {
    name: 'Pro Plan',
    monthly: {
      price: 99,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || 'not_set'
    },
    annual: {
      price: 827,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID || 'not_set'
    },
    features: [
      '2 Dream Buyer Avatars',
      'Uncover "obsessed stalker" level insights',
      'Discover Deep Seeded Buying triggers',
      '4 Long Form Facebook Ads',
      '200+ Facebook Ad Headlines',
      '30 High CTR Link Descriptions',
      '1000+ Ad combinations',
      '6 Direct Response Headline Sets'
    ]
  }
};

// Add debug logging
console.log('Price IDs:', {
  agencyMonthly: process.env.NEXT_PUBLIC_STRIPE_AGENCY_MONTHLY_PRICE_ID,
  agencyAnnual: process.env.NEXT_PUBLIC_STRIPE_AGENCY_ANNUAL_PRICE_ID,
  proMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
  proAnnual: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID
}); 