import Stripe from 'stripe';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getUser, linkStripeCustomer } from '../../../lib/kv';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const user = await getUser(session.user.email);
  let customerId = user?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({ email: session.user.email });
    customerId = customer.id;
    await linkStripeCustomer(session.user.email, customerId);
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/members?welcome=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/subscribe`,
    subscription_data: {
      metadata: { userEmail: session.user.email },
    },
  });

  return res.status(200).json({ url: checkoutSession.url });
}
