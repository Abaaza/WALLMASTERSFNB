const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase, User } = require('./_models');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await connectToDatabase();
    
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email: normalizedEmail, password: hashedPassword });
    await user.save();

    // Generate access and refresh tokens
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    // Save the refreshToken in the user's record
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: "Registration failed", 
      error: error.message 
    });
  }
}; 