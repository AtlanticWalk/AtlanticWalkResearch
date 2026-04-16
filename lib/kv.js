import { kv } from '@vercel/kv';

export async function getUser(email) {
  if (!email) return null;
  return await kv.get(`user:${email.toLowerCase()}`);
}

export async function setUser(email, data) {
  return await kv.set(`user:${email.toLowerCase()}`, data);
}

export async function updateUser(email, updates) {
  const existing = await getUser(email);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  await setUser(email, updated);
  return updated;
}

export async function linkStripeCustomer(email, stripeCustomerId) {
  await kv.set(`stripe:${stripeCustomerId}`, email.toLowerCase());
  return await updateUser(email, { stripeCustomerId });
}

export async function getEmailByStripeId(stripeCustomerId) {
  return await kv.get(`stripe:${stripeCustomerId}`);
}
