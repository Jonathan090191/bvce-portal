import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  })
}

export async function createCustomer(email: string, name: string) {
  return stripe.customers.create({ email, name })
}

export async function getSubscriptionStatus(customerId: string) {
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  })
  return subs.data.length > 0 ? 'active' : 'inactive'
}
