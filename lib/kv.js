import Redis from 'ioredis';
import crypto from 'crypto';

// Reuse connection across serverless invocations
let client;
function getClient() {
  if (!client) {
    client = new Redis(process.env.REDIS_URL, {
      tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined,
      maxRetriesPerRequest: 3,
    });
  }
  return client;
}

export async function getUser(email) {
  if (!email) return null;
  const r = getClient();
  const data = await r.get(`user:${email.toLowerCase()}`);
  return data ? JSON.parse(data) : null;
}

export async function setUser(email, data) {
  const r = getClient();
  return await r.set(`user:${email.toLowerCase()}`, JSON.stringify(data));
}

export async function updateUser(email, updates) {
  const existing = await getUser(email);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  await setUser(email, updated);
  return updated;
}

export async function linkStripeCustomer(email, stripeCustomerId) {
  const r = getClient();
  await r.set(`stripe:${stripeCustomerId}`, email.toLowerCase());
  return await updateUser(email, { stripeCustomerId });
}

export async function getEmailByStripeId(stripeCustomerId) {
  const r = getClient();
  return await r.get(`stripe:${stripeCustomerId}`);
}

// ── Password reset tokens (1-hour TTL) ──────────────────────────────────────

export async function createResetToken(email) {
  const r = getClient();
  const token = crypto.randomBytes(32).toString('hex');
  // Store for 1 hour
  await r.setex(`reset:${token}`, 3600, email.toLowerCase());
  return token;
}

export async function getResetToken(token) {
  const r = getClient();
  return await r.get(`reset:${token}`);
}

export async function deleteResetToken(token) {
  const r = getClient();
  return await r.del(`reset:${token}`);
}
