This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## MySQL Logging (Recommendation Recap)

This project supports direct MySQL logging for recommendation attempts.

### 1) Create table

Run SQL in [`docs/sql/recommendation_logs.sql`](docs/sql/recommendation_logs.sql).

### 2) Set environment variables

Use either `MYSQL_URL` or discrete fields below.

```env
# Option A
MYSQL_URL=mysql://user:password@127.0.0.1:3306/umrahyuk

# Option B
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=secret
MYSQL_DATABASE=umrahyuk
```

If MySQL env vars are not set, app still works and skips DB logging.

## Admin Logs Protection

`/admin/logs` is protected by middleware token.

Set token in `.env.local`:

```env
ADMIN_TOKEN=your-strong-admin-token
```

First access:

- Open `/admin/logs?token=your-strong-admin-token`
- Middleware validates token and stores an HttpOnly cookie for `/admin`
- Next visits to `/admin/logs` won't need query token during cookie lifetime

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Poppins](https://fonts.google.com/specimen/Poppins) as the primary typeface.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
