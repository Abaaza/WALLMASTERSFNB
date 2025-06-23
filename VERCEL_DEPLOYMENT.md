# Vercel Deployment Guide

## Prerequisites

1. A Vercel account (https://vercel.com)
2. MongoDB database (MongoDB Atlas recommended)
3. Email service credentials (Outlook/Office365)

## Environment Variables Setup

In your Vercel dashboard, add the following environment variables:

### Database

- `CONNECTION_STRING`: Your MongoDB connection string

### JWT Configuration

- `JWT_SECRET`: A secure random string for JWT token signing
- `JWT_REFRESH_SECRET`: A secure random string for refresh token signing

### Email Configuration

- `EMAIL_USER`: Your email address (e.g., info@wall-masters.com)
- `EMAIL_PASS`: Your email password or app-specific password

### Frontend Configuration

After deployment, update your frontend environment:

- `VITE_API_BASE_URL`: Your Vercel app URL + /api (e.g., https://your-app-name.vercel.app/api)

## Deployment Steps

1. **Install Vercel CLI** (optional):

   ```bash
   npm i -g vercel
   ```

2. **Deploy via GitHub**:

   - Connect your GitHub repository to Vercel
   - Import your project on Vercel dashboard
   - Set the environment variables listed above
   - Deploy

3. **Deploy via CLI**:
   ```bash
   vercel
   ```

## Project Structure

- Frontend: `client/` - React/Vite app
- Backend: `server/` - Express.js API (deployed as serverless functions)
- Configuration: `vercel.json` - Vercel deployment configuration

## API Routes

All backend routes are accessible under `/api/*`:

- Authentication: `/api/login`, `/api/register`
- Products: `/api/products`
- Orders: `/api/orders`
- User management: `/api/users/*`

## Notes

- The backend is deployed as serverless functions
- Frontend is served as static files
- MongoDB connection is established for each serverless function call
- Email functionality uses SMTP with Office365

## Troubleshooting

1. **MongoDB connection issues**: Ensure your CONNECTION_STRING is correct and accessible from Vercel
2. **Email not working**: Check EMAIL_USER and EMAIL_PASS credentials
3. **CORS issues**: The backend allows all origins (`*`) - adjust as needed for production
4. **Build errors**: Ensure all dependencies are listed in package.json files

5. **Set environment variables in Vercel dashboard:**
   - Go to Settings → Environment Variables
   - Add all variables from `.env` file:
     - `CONNECTION_STRING` - MongoDB connection string
     - `JWT_SECRET` - JWT secret key
     - `JWT_REFRESH_SECRET` - JWT refresh secret
     - `EMAIL_USER` - Email for notifications
     - `EMAIL_PASS` - Email password
     - `VITE_API_BASE_URL` - Set to your production URL (e.g., https://your-app.vercel.app)

## MongoDB Configuration for Serverless

**Important:** The MongoDB connection has been optimized for serverless deployment:

1. **Connection Options:**

   - Removed deprecated options: `useNewUrlParser`, `useUnifiedTopology`, `bufferMaxEntries`
   - Added serverless optimizations:
     - `maxPoolSize: 1` - Limits connection pool for serverless
     - `serverSelectionTimeoutMS: 5000` - Faster timeout for serverless
     - `connectTimeoutMS: 10000` - Connection timeout
     - `bufferCommands: false` - Don't buffer commands when disconnected

2. **Connection Caching:**

   - Implemented connection caching to reuse connections across function invocations
   - Prevents creating multiple connections in serverless environment

3. **MongoDB Atlas Network Access:**

   - **CRITICAL:** Add `0.0.0.0/0` to your MongoDB Atlas Network Access whitelist
   - This allows Vercel's dynamic IPs to connect to your database
   - Go to MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere

4. **Testing the Connection:**
   - Use the `/api/health` endpoint to check MongoDB connection status
   - Example: `https://your-app.vercel.app/api/health`

## Project Structure

- Frontend: `client/` - React/Vite app
- Backend: `server/` - Express.js API (deployed as serverless functions)
- Configuration: `vercel.json` - Vercel deployment configuration
