# Vercel Deployment Guide

## Prerequisites

1. A Vercel account (https://vercel.com)
2. MongoDB database (MongoDB Atlas recommended)
3. Email service credentials (Outlook/Office365)

## Required Environment Variables

Set these environment variables in your Vercel dashboard:

### Database Configuration

- `CONNECTION_STRING`: Your MongoDB connection string
  ```
  mongodb+srv://username:password@cluster.mongodb.net/database
  ```

### JWT Configuration

- `JWT_SECRET`: Secret key for JWT tokens (use a strong, random string)
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens (different from JWT_SECRET)

### Email Configuration

- `EMAIL_USER`: Your Office 365 email address
- `EMAIL_PASS`: Your Office 365 app password

### Optional Environment Variables

- `VITE_API_BASE_URL`: Leave empty for production (uses relative URLs)

## Deployment Steps

1. **Build Configuration**: Already configured in `vercel.json`
2. **Environment Variables**: Set all required variables in Vercel dashboard
3. **Deploy**: Use `vercel deploy` or connect to GitHub for automatic deployments

## Performance Optimizations Applied

- **MongoDB Connection Caching**: Reuses connections between serverless function calls
- **Query Timeouts**: Added timeouts to prevent hanging requests
- **Lean Queries**: Uses `.lean()` for better performance
- **Cache Headers**: API responses include cache headers
- **Request Timeouts**: Global timeout middleware to prevent 504 errors

## Common Issues and Solutions

### CORS Errors

- Fixed by using relative API URLs (`/api/...`) instead of absolute URLs
- Removed hardcoded AWS API Gateway URLs

### Timeout Issues

- Increased function timeout to 90 seconds
- Added connection timeouts (15s) and query timeouts (20s)
- Optimized MongoDB connection with proper timeouts

### Environment Variables

- Use relative URLs in production (don't set VITE_API_BASE_URL)
- Ensure all required variables are set in Vercel dashboard

## Monitoring

Use Vercel's function logs to monitor:

- MongoDB connection status
- API response times
- Error rates

## Database Connection Issues

If you see timeout errors:

1. Check MongoDB Atlas network access (allow 0.0.0.0/0)
2. Verify connection string format
3. Check database user permissions
4. Monitor MongoDB Atlas metrics for connection limits

## Project Structure

- Frontend: `client/`
