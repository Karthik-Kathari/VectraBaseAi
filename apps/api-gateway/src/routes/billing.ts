/**
 * VectraBase AI — Billing, Subscriptions & Stripe Paywall Routes
 *
 * GET  /api/billing/status             — Get current plan, trial usage, and limits
 * POST /api/billing/checkout           — Create Stripe checkout session (or sandbox simulation)
 * POST /api/billing/portal             — Create Stripe customer portal session
 * POST /api/billing/webhook            — Stripe event webhook (handles checkout.session.completed)
 * POST /api/billing/dev-upgrade-test   — Instant upgrade simulation for testing
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const billingRouter = Router();

// ─── GET /status ─────────────────────────────────────────────────────────────
billingRouter.get('/status', authenticate, async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000001';

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        trialQueriesUsed: true,
        trialQueriesLimit: true,
        trialDocsUsed: true,
        trialDocsLimit: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!tenant) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tenant not found' } });
      return;
    }

    const now = new Date();
    const isExpired = tenant.trialEndsAt ? now > tenant.trialEndsAt : false;
    const isQuotaExceeded = tenant.trialQueriesUsed >= tenant.trialQueriesLimit;
    const isTrialActive = tenant.plan === 'FREE' && !isExpired && !isQuotaExceeded;

    res.json({
      success: true,
      data: {
        plan: tenant.plan,
        subscriptionStatus: tenant.subscriptionStatus,
        isTrialActive,
        isExpired,
        isQuotaExceeded,
        trial: {
          endsAt: tenant.trialEndsAt,
          daysRemaining: tenant.trialEndsAt ? Math.max(0, Math.ceil((tenant.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0,
          queriesUsed: tenant.trialQueriesUsed,
          queriesLimit: tenant.trialQueriesLimit,
          queriesRemaining: Math.max(0, tenant.trialQueriesLimit - tenant.trialQueriesUsed),
          docsUsed: tenant.trialDocsUsed,
          docsLimit: tenant.trialDocsLimit,
          docsRemaining: Math.max(0, tenant.trialDocsLimit - tenant.trialDocsUsed),
        },
        pricing: {
          pro: { price: 19, interval: 'month', currency: 'usd' },
          enterprise: { price: 99, interval: 'month', currency: 'usd' },
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// ─── POST /checkout ──────────────────────────────────────────────────────────
billingRouter.post('/checkout', authenticate, async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000001';
  const { plan = 'PRO', returnUrl } = req.body;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tenant not found' } });
      return;
    }

    // If Stripe secret key is configured, create live/test Stripe session
    if (stripeSecretKey) {
      // Lazy load Stripe
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-11-20.acacia' as any });

      const priceId = plan === 'ENTERPRISE' ? process.env.STRIPE_ENTERPRISE_PRICE_ID : process.env.STRIPE_PRO_PRICE_ID;
      const appUrl = returnUrl || process.env.APP_URL || 'http://localhost:3000';

      const session = await stripe.checkout.sessions.create({
        customer_email: req.user?.email,
        client_reference_id: tenant.id,
        line_items: [
          priceId
            ? { price: priceId, quantity: 1 }
            : {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: `VectraBase AI ${plan}`,
                    description: 'Unlimited queries, real-time embeddings, and dedicated SLA',
                  },
                  unit_amount: plan === 'ENTERPRISE' ? 9900 : 1900,
                  recurring: { interval: 'month' },
                },
                quantity: 1,
              },
        ],
        mode: 'subscription',
        success_url: `${appUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/pricing?canceled=true`,
        metadata: {
          tenantId: tenant.id,
          userId: req.user?.sub || '',
          targetPlan: plan,
        },
      } as any);

      res.json({
        success: true,
        data: {
          checkoutUrl: session.url,
          sessionId: session.id,
          mode: 'stripe',
        },
      });
      return;
    }

    // Sandbox / Test Mode Instant Upgrade Simulation when no STRIPE_SECRET_KEY is provided
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        plan: plan === 'ENTERPRISE' ? 'ENTERPRISE' : 'PRO',
        subscriptionStatus: 'ACTIVE',
      },
    });

    res.json({
      success: true,
      data: {
        message: `Plan upgraded to ${plan} in sandbox mode!`,
        mode: 'sandbox_instant',
        plan,
        subscriptionStatus: 'ACTIVE',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'CHECKOUT_ERROR', message: err.message } });
  }
});

// ─── POST /webhook ───────────────────────────────────────────────────────────
billingRouter.post('/webhook', async (req: Request, res: Response) => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    res.status(400).json({ success: false, message: 'Stripe webhook secrets not configured' });
    return;
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-11-20.acacia' as any });
    const sig = req.headers['stripe-signature'] as string;

    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const tenantId = session.client_reference_id || session.metadata?.tenantId;
      const plan = session.metadata?.targetPlan === 'ENTERPRISE' ? 'ENTERPRISE' : 'PRO';

      if (tenantId) {
        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            plan,
            subscriptionStatus: 'ACTIVE',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any;
      const tenant = await prisma.tenant.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (tenant) {
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            plan: 'FREE',
            subscriptionStatus: 'CANCELED',
          },
        });
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// ─── POST /reset-trial-demo ──────────────────────────────────────────────────
billingRouter.post('/reset-trial-demo', authenticate, async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000001';

  try {
    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        plan: 'FREE',
        subscriptionStatus: 'TRIALING',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        trialQueriesUsed: 0,
        trialDocsUsed: 0,
      },
    });

    res.json({ success: true, data: { tenant: updated, message: 'Free trial reset to 50 queries + 14 days!' } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});
