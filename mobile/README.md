# SHOKON Android app

Expo / React Native MVP for SHOKON, currently on **Expo SDK 57**. The mobile app lives in `mobile/` and is intentionally separate from the Next.js web app at the repository root.

## Run in Expo Go

1. Install Node.js 22+ on a computer and install Expo Go on Android.
2. From `Shokon/mobile`, install dependencies with `npm install --legacy-peer-deps`.
3. Run `npx expo start --tunnel`.
4. Scan the QR code in Expo Go.

The mobile app currently uses the SHOKON Supabase backend for provider data, authentication, bookings and messaging. `.env.example` documents the variables for overriding the public client configuration.

## MVP flows

- Browse active providers, filter by role/city, open a provider and request a one-hour cash booking.
- Sign up/sign in with Supabase Auth.
- View customer bookings and payment status.
- Message from accepted bookings with Supabase Realtime.
- Provider onboarding, incoming bookings, accept/decline, mark completed, and mark cash received.

## Checks

The repository CI runs dependency compatibility checks, Expo Doctor, TypeScript, and a web export for the mobile project.
