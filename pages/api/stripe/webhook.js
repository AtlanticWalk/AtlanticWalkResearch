import Stripe from 'stripe';
import Redis from 'ioredis';
import { updateUser, getEmailByStripeId } from '../../../lib/kv';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: { bodyParser: false },
};

async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function resolveEmail(customerId, fallbackEmail) {
  if (fallbackEmail) return fallbackEmail;
  const cached = await getEmailByStripeId(customerId);
  if (cached) return cached;
  const customer = await stripe.customers.retrieve(customerId);
  return customer.email;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Webhook] Signature error:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription') break;

        const email = await resolveEmail(
          session.customer,
          session.customer_details?.email
        );
        if (!email) break;

        await updateUser(email, {
          isSubscribed: true,
          subscriptionId: session.subscription,
          stripeCustomerId: session.customer,
        });

        // Store reverse lookup
        const Redis2 = (await import('ioredis')).default;
        console.log(`[Webhook] Subscribed: ${email}`);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const email = await resolveEmail(sub.customer, null);
        if (!email) break;

        const isActive = ['active', 'trialing'].includes(sub.status);
        await updateUser(email, { isSubscribed: isActive, subscriptionId: sub.id });
        console.log(`[Webhook] Subscription updated: ${email} → ${sub.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const email = await resolveEmail(sub.customer, null);
        if (!email) break;

        await updateUser(email, { isSubscribed: false, subscriptionId: null });
        console.log(`[Webhook] Subscription cancelled: ${email}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const email = await resolveEmail(invoice.customer, invoice.customer_email);
        if (!email) break;

        await updateUser(email, { isSubscribed: false });
        console.log(`[Webhook] Payment failed: ${email}`);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('[Webhook] Handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }

  return res.status(200).json({ received: true });
}
