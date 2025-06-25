const jwt = require('jsonwebtoken');
const { connectToDatabase, User } = require('../_models');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Authenticate user
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    await connectToDatabase();
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      userId: user._id, 
      name: user.name, 
      email: user.email 
    });
  } catch (error) {
    console.error('User details error:', error);
    res.status(500).json({ 
      message: "Failed to retrieve user details",
      error: error.message 
    });
  }
}; 