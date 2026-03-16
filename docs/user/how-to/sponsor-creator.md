# How to Sponsor a Creator

> **Goal**: Support a creator (teacher, maintainer, or researcher) with a one-time or recurring sponsorship via the platform.
>
> **Prerequisites**: Signed-in user; payment method (Stripe); the creator or sponsorship target must be available on the platform.

## Overview

Sponsorship is voluntary and never gates content access. You discover a creator (e.g. after completing a Learn track or from the Hub/Labs), choose to support them, pick one-time or recurring amount, and complete payment. The platform records the sponsorship event and notifies the creator; both portfolios can reflect it.

## Steps

### 1. Find the creator or sponsorship page

After completing a Learn track you may see the track creator’s profile with a **Support this creator** (or similar) option. You can also reach a creator’s profile from the Hub, Labs, or search. Open their sponsorship page or the sponsorship flow for that creator.

### 2. Choose amount and frequency

Select:

- **One-time** or **Recurring** (e.g. monthly)
- **Amount** (within the allowed range)

The UI shows the amount and currency; payment is processed via Stripe (or the configured provider).

### 3. Complete payment

Enter payment details (or use a saved method) and confirm. The platform creates a **Sponsorship** record and may return a client secret or confirmation. The creator receives a notification; the event is recorded for portfolios and impact metrics.

### 4. (Optional) View impact

You or the creator can view impact metrics (e.g. total support, number of sponsors) on the creator’s profile or in the sponsorship detail, if the platform exposes them.

## Result

The creator has received your sponsorship; your portfolio and theirs may show the sponsorship. Content access is unchanged — sponsorship does not unlock or lock content.

## Variations

**Via API**: If the API exposes sponsorship creation, you would call the appropriate endpoint with creator/target ID and amount; for Stripe, the server may return a `client_secret` for the client to confirm payment with Stripe.js. See [Sponsorships API](../reference/api/sponsorships.md).

**Recurring**: For recurring sponsorship, the platform and Stripe manage the subscription; you can cancel or change amount in account or subscription settings.

## Troubleshooting

**400 VALIDATION_ERROR** — Invalid amount or target. Check minimum/maximum and that the creator ID is valid.

**404 NOT_FOUND** — Creator or sponsorship target not found. Use a valid profile or ID.

**503 SERVICE_UNAVAILABLE** — Payment provider (Stripe) not configured or unavailable. Try again later.

## See Also

- [Sponsorships API](../reference/api/sponsorships.md)
- [Tutorial: Onboarding to First Artifact](../tutorials/01-onboarding-first-artifact.md) (for when sponsorship is offered after a track)
