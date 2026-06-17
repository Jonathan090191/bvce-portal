import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  const getCustomerId = (obj: any) =>
    typeof obj.customer === 'string' ? obj.customer : obj.customer?.id

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = getCustomerId(sub)
      const status = sub.status === 'active' ? 'active' : 'inactive'
      await supabaseAdmin
        .from('profiles')
        .update({ subscription_status: status, stripe_subscription_id: sub.id })
        .eq('stripe_customer_id', customerId)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = getCustomerId(sub)
      await supabaseAdmin
        .from('profiles')
        .update({ subscription_status: 'inactive' })
        .eq('stripe_customer_id', customerId)
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = getCustomerId(invoice)
      await supabaseAdmin
        .from('profiles')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
