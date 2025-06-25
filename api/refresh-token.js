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
    
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          return res
            .status(403)
            .json({ message: "Invalid or expired refresh token" });
        }

        const newAccessToken = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );

        const newRefreshToken = jwt.sign(
          { userId: user._id },
          process.env.JWT_REFRESH_SECRET,
          {
            expiresIn: "30d",
          }
        );
        user.refreshToken = newRefreshToken;
        await user.save();

        res.json({
          success: true,
          token: newAccessToken,
          refreshToken: newRefreshToken,
          user: { _id: user._id, name: user.name, email: user.email },
        });
      }
    );
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Failed to refresh token" });
  }
}; 