# Luv Kush Website - Backend

Backend server for the Luv Kush Website handling payment processing (Khalti & eSewa) and MongoDB storage.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with the following variables:
```env
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/luvkush

# Khalti (get from Khalti dashboard)
KHALTI_SECRET_KEY=your_khalti_secret_key

# eSewa
ESEWA_SCD=EPAYTEST
ESEWA_ENV=uat

# Frontend URLs
FRONTEND_SUCCESS_URL=http://localhost:3000/paid
FRONTEND_FAILURE_URL=http://localhost:3000/pay-failed
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the server:
```bash
npm run dev    # Development mode with auto-reload
npm start      # Production mode
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/payments/khalti/verify` - Verify Khalti payment
- `GET /api/payments/esewa/success` - eSewa payment success callback
- `GET /api/payments/esewa/failure` - eSewa payment failure callback

## Production Deployment

1. Update `.env` with production values
2. Set `ESEWA_ENV=live`
3. Use production Khalti secret key
4. Update CORS_ORIGIN to production frontend URL
