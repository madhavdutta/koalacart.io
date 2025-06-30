# KoalaCart

A powerful online selling platform where users connect their own payment gateways for complete control over their transactions.

## Features

- **Multi-role System**: Admin (sellers), Affiliates, and Buyers
- **User-Connected Payment Gateways**: Users connect their own Stripe accounts
- **Product Management**: Create and manage digital/physical products
- **Affiliate System**: Built-in affiliate tracking and management
- **Custom Checkout Pages**: Branded checkout experiences
- **Analytics Dashboard**: Comprehensive sales and performance analytics

## Development

Run the dev server:

```shellscript
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

## Tech Stack

- **Framework**: Remix with Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Payment Processing**: User-connected Stripe accounts
- **TypeScript**: Full type safety

## Architecture

Users connect their own Stripe accounts to KoalaCart, giving them:
- Complete control over their payment processing
- Direct access to their funds
- Custom payment settings and configurations
- Full ownership of customer payment data
