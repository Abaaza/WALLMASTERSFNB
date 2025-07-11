# Wall Masters F&B

A modern e-commerce platform for food & beverage products, built with React and Node.js.

## 🚀 Live Demo

- **Frontend**: [Your Vercel App URL]
- **API**: [Your Vercel App URL]/api

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for build tooling
- **Chakra UI** for components
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Axios** for API calls

### Backend

- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Nodemailer** for email services
- **bcrypt** for password hashing

### Deployment

- **Vercel** for both frontend and backend (serverless functions)

## 📦 Features

- 🛒 Product catalog with search and filtering
- 👤 User authentication and profiles
- 📋 Order management system
- 📧 Email notifications
- 💾 Save items for later
- 📍 Address management
- 🔐 Password reset functionality
- 📱 Responsive design

## 🚀 Deployment

This application is configured for **Vercel** deployment. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

1. Fork this repository
2. Import to Vercel from your GitHub account
3. Set environment variables in Vercel dashboard
4. Deploy!

## 🏃‍♂️ Local Development

### Prerequisites

- Node.js 16+
- MongoDB instance
- npm or yarn

### Setup

1. **Clone the repository**

   ```bash
   git clone [your-repo-url]
   cd wallmasters-fnb
   ```

2. **Install dependencies**

   ```bash
   # Frontend
   cd client
   npm install

   # Backend
   cd ../server
   npm install
   ```

3. **Environment Variables**
   Create `.env` files:

   **Server (.env in server/):**

   ```
   CONNECTION_STRING=mongodb://localhost:27017/wallmasters
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   EMAIL_USER=your_email@outlook.com
   EMAIL_PASS=your_password
   ```

   **Client (.env in client/):**

   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **Start development servers**

   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

## 📁 Project Structure

```
wallmasters-fnb/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── ProfileScreens/ # User profile pages
│   │   ├── cartsscreens/   # Cart and checkout
│   │   ├── redux/          # State management
│   │   └── assets/         # Static assets
├── server/                 # Express backend
│   ├── models/             # MongoDB models
│   └── index.js            # Main server file
├── vercel.json             # Vercel configuration
└── VERCEL_DEPLOYMENT.md    # Deployment guide
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🐛 Issues

For bugs and feature requests, please create an issue in this repository.
