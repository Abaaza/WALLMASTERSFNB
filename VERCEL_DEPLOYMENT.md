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
