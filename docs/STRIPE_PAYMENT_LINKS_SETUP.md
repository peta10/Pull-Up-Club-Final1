# Stripe Payment Links Setup

## Overview
This document explains how to configure Stripe Payment Links for the Pull-Up Club secure signup flow.

## Required Configuration

### 1. Update Success URLs in Stripe Dashboard

For both payment links, you need to update the success URL to redirect to our secure signup access page:

**New Success URL Format:**
```
https://your-domain.com/signup-access?session_id={CHECKOUT_SESSION_ID}
```

### 2. Payment Link Configuration

#### Monthly Plan
- **Current Link:** `https://buy.stripe.com/test_dRmdR9dos2kmaQcdHGejK00`
- **Success URL:** `https://pullupclub.com/signup-access?session_id={CHECKOUT_SESSION_ID}`
- **Cancel URL:** `https://pullupclub.com/subscription`

#### Annual Plan
- **Current Link:** `https://buy.stripe.com/test_28EcN5dosf784rO0UUejK01`
- **Success URL:** `https://pullupclub.com/signup-access?session_id={CHECKOUT_SESSION_ID}`
- **Cancel URL:** `https://pullupclub.com/subscription`

## Steps to Update in Stripe Dashboard

1. **Log into Stripe Dashboard**
   - Go to [dashboard.stripe.com](https://dashboard.stripe.com)
   - Switch to test mode for testing

2. **Navigate to Payment Links**
   - Go to Products → Payment Links
   - Find your existing payment links

3. **Edit Payment Link Settings**
   - Click on each payment link
   - Go to "Settings" or "Edit"
   - Update the "Success URL" field
   - Update the "Cancel URL" field
   - Save changes

4. **Test the Flow**
   - Use test card numbers to verify the flow works
   - Confirm redirect to `/signup-access` page
   - Verify session ID is passed correctly

## Security Benefits

This setup provides several security benefits:

1. **Session Verification**: Each signup attempt is verified against Stripe's payment session
2. **Tamper Prevention**: Session IDs cannot be guessed or manipulated
3. **Payment Confirmation**: Account creation only occurs after confirmed payment
4. **Time Limits**: Stripe sessions have built-in expiration

## Test Cards

For testing, use these Stripe test card numbers:

- **Success:** `4242424242424242`
- **Declined:** `4000000000000002`
- **Requires Auth:** `4000002500003155`

## Environment Variables

Ensure these environment variables are properly set:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## Troubleshooting

### Common Issues

1. **"Session not found" errors**
   - Check that STRIPE_SECRET_KEY is correctly set
   - Verify the session ID is being passed correctly

2. **CORS errors**
   - Ensure the verify-stripe-session Edge Function is deployed
   - Check CORS headers in the function

3. **Redirect not working**
   - Verify success URLs are saved correctly in Stripe
   - Check that URLs include the session_id parameter

### Debugging

1. **Check session ID in URL**
   ```javascript
   const searchParams = new URLSearchParams(window.location.search);
   const sessionId = searchParams.get('session_id');
   console.log('Session ID:', sessionId);
   ```

2. **Test Edge Function directly**
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/verify-stripe-session \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "cs_test_..."}'
   ```

## Production Setup

Before going live:

1. **Switch to live mode** in Stripe Dashboard
2. **Update payment links** with production URLs
3. **Update environment variables** to use live keys
4. **Test end-to-end flow** with real payment methods 