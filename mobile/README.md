# SHOKON Android app

Expo/React Native MVP for SHOKON. It uses the same Supabase backend as the web app.

## Run in Expo Go

1. Install Node.js 20+ on a computer and install Expo Go on Android.
2. From `Shokon/mobile`, create `.env` from `.env.example` and set the two Expo public Supabase variables.
3. Run `npx expo start --tunnel`.
4. Scan the QR code in Expo Go. The phone and computer do not need to be on the same Wi-Fi when using the tunnel.

## MVP flows

- Browse active providers, filter by role/city, open a provider and request a one-hour cash booking.
- Sign up/sign in with Supabase Auth.
- View customer bookings and payment status.
- Message from accepted bookings with Supabase Realtime.
- Provider onboarding, incoming bookings, accept/decline, mark completed, and mark cash received.

## Checks

Run `npm install` then `npm run typecheck` before opening the app in Expo Go.
