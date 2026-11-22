# Pretty Much Booked — Expo (mobile)

React Native shell alongside the Next.js web app at `/agent`.

## Run

```bash
cd /agent/mobile
npm run web      # http://localhost:8081
npm start
```

## Booking flow (Hick’s / premium)

1. Home — What do you need? → Hair / Nails / Makeup
2. Service pick — tap one (no secondary CTA)
3. Pros — max 3 visible + Show more
4. When? — day + time (ASAP optional)
5. Where? — address (+ optional notes)
6. Pay stub — deposit mock → confirmation
7. Confirmation — You’re booked + 10:00 countdown
8. `/bookings/[id]` — tracking states (pending → completed)

## Auth

Phone OTP via Next `/api/auth/*` (`EXPO_PUBLIC_API_URL` or `extra.apiUrl`, default `http://127.0.0.1:3000`). Mock/live follows web config. Screens: `/login`, `/signup`.

## Booking APIs

Expo pros list → `GET /api/pros?serviceId=`  
Pay → `POST /api/bookings` (then local tracking)  
Bookings tab → `GET /api/bookings`  
Fallback to local mock on network fail (`lib/catalog-client.ts`).

## Messages

- Tab: list (seed inbox) + empty state (`?empty=1` or Clear)
- `/messages/[id]` — thread stub + composer

## Pro (mirrors web `/pro`)

- `/pro/join` — Become a pro
- `/pro/onboarding?step=` — verify → profile → services → area → done
- `/pro/dashboard` — available now, earnings, bookings stubs
- `/pro/hours`, `/pro/bookings/[id]`

Tokens: `constants/theme.ts` — `#5B2C87`, gold `#D4AF37`, `#FAFAFA`
