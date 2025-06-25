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
    
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

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

    res.status(200).json({
      message: "Login successful",
      user: { _id: user._id, name: user.name, email: user.email },
      token: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: "Login failed", 
      error: error.message 
    });
  }
}; 