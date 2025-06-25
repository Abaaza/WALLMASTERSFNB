const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { connectToDatabase, User } = require('./_models');

// Create transporter
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: "SSLv3",
  },
});

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
    
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // Expires in 1 hour
    await user.save();

    const resetLink = `https://www.wall-masters.com/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: `"Wall Masters" <info@wall-masters.com>`,
      to: email,
      subject: "Password Reset",
      text: `Please use the following link to reset your password: ${resetLink}`,
      html: `<p>Please use the following link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });

    res.status(200).json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ message: "Failed to send password reset email." });
  }
}; 