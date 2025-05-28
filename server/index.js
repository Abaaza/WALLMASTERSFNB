const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("./models/user");
const Order = require("./models/order");
const serverless = require("serverless-http");

const app = express();
const PORT = process.env.PORT || 3000; // Use the Heroku port or fallback to 3000

// Middleware
app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Database connection
const mongoURI = process.env.CONNECTION_STRING;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if DB connection fails
  });

const requiredEnvVars = [
  "CONNECTION_STRING",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1); // Exit the application if a required env var is missing
  }
});

// ------------------ UTILITIES ------------------
const generateOrderId = () => {
  const datePart = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${datePart}-${randomPart}`;
};

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

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
  debug: true, // Enable debug output
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Server is ready to take our messages");
  }
});

// Define Product schema and model
const productSchema = new mongoose.Schema({}, { collection: "products" });
const Product = mongoose.model("Product", productSchema);

// ------------------ ROUTES ------------------

// Login Route with Refresh Token
app.post("/login", async (req, res) => {
  try {
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
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error });
  }
});

// Root Route
app.get("/", (req, res) => {
  res.send("Hello from Wallmasters Backend!");
});

// Fetch All Products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).send("Error fetching products.");
  }
});

// Register Route
app.post("/register", async (req, res) => {
  try {
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
    const user = new User({ name, email, password: hashedPassword });
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
    console.error("User registration error:", error);
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
});

// Secure Change Password
app.post("/change-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      console.error("Validation error: Missing fields in the request body.");
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.error("User not found for email:", email);
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      console.error("Incorrect old password provided.");
      return res.status(400).json({ message: "Incorrect old password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log("Password updated successfully for user:", email);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
});

// Place Order Route
app.post("/orders", async (req, res) => {
  try {
    const { products, totalPrice, shippingAddress, userId } = req.body;

    const newOrder = new Order({
      orderId: generateOrderId(),
      user: userId || "guest",
      products,
      totalPrice,
      shippingAddress,
    });

    await newOrder.save();

    const customerMailOptions = {
      from: `"Wall Masters" <${process.env.EMAIL_USER}>`,
      to: shippingAddress.email,
      subject: "Wall Masters Order Confirmation",
      text: `Hello ${
        shippingAddress.name
      },\n\nThank you for your order! Your order ID is ${
        newOrder.orderId
      }. We will process your order soon.\n\nOrder Details:\n- Total Price: ${totalPrice} EGP\n- Items: ${products
        .map((item) => `${item.name} (x${item.quantity})`)
        .join(", ")}\n\nRegards,\nWall Masters Team`,
    };

    const adminMailOptions = {
      from: `"Wall Masters" <${process.env.EMAIL_USER}>`,
      to: "info@wall-masters.com",
      subject: "New Order Received - Wall Masters",
      text: `New Order Received:\n\nOrder ID: ${
        newOrder.orderId
      }\nCustomer Name: ${shippingAddress.name}\nCustomer Email: ${
        shippingAddress.email
      }\nTotal Price: ${totalPrice} EGP\n\nOrder Details:\n- Items: ${products
        .map((item) => `${item.name} (x${item.quantity})`)
        .join(", ")}\n\nPlease process this order as soon as possible.`,
    };

    await Promise.all([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    console.log("Confirmation email sent to user and admin.");
    res.status(201).json({
      message: "Order placed successfully, emails sent.",
      order: newOrder,
    });
  } catch (error) {
    console.error("Order placement failed:", error);
    res.status(500).json({ message: "Order placement failed", error });
  }
});

// Get User Orders
app.get("/orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
});

// Retrieve Addresses
app.get("/addresses/:userId", async (req, res) => {
  try {
    console.log("Retrieving addresses for user:", req.params.userId);
    const user = await User.findById(req.params.userId);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Addresses retrieved:", user.savedAddresses);
    res.status(200).json(user.savedAddresses || []);
  } catch (error) {
    console.error("Error loading addresses:", error);
    res.status(500).json({ message: "Failed to load addresses", error });
  }
});

// Delete Address
app.delete("/addresses/:userId/:addressId", async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(addressId)
    ) {
      return res.status(400).json({ message: "Invalid userId or addressId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found with id: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    const addressIndex = user.savedAddresses.findIndex(
      (address) => address._id.toString() === addressId
    );

    if (addressIndex === -1) {
      console.error(`Address not found for id: ${addressId}`);
      return res.status(404).json({ message: "Address not found" });
    }

    user.savedAddresses.splice(addressIndex, 1);

    if (user.savedAddresses.length === 1) {
      user.savedAddresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      message: "Address deleted successfully",
      savedAddresses: user.savedAddresses,
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Failed to delete address", error });
  }
});

// Save New Address
app.post("/addresses/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const newAddress = req.body.address; // Ensure the frontend sends { address: {...} }

    if (!newAddress || typeof newAddress !== "object") {
      return res.status(400).json({ message: "Invalid address format." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.savedAddresses = user.savedAddresses || [];

    const normalizeString = (str) => (str || "").trim().toLowerCase();

    const duplicate = user.savedAddresses.find((savedAddress) => {
      return (
        normalizeString(savedAddress.name) ===
          normalizeString(newAddress.name) &&
        normalizeString(savedAddress.email) ===
          normalizeString(newAddress.email) &&
        normalizeString(savedAddress.mobileNo) ===
          normalizeString(newAddress.mobileNo) &&
        normalizeString(savedAddress.houseNo) ===
          normalizeString(newAddress.houseNo) &&
        normalizeString(savedAddress.street) ===
          normalizeString(newAddress.street) &&
        normalizeString(savedAddress.city) ===
          normalizeString(newAddress.city) &&
        normalizeString(savedAddress.postalCode) ===
          normalizeString(newAddress.postalCode)
      );
    });

    if (duplicate) {
      return res.status(409).json({ message: "Duplicate address detected." });
    }

    user.savedAddresses.push(newAddress);
    await user.save();

    res.status(201).json({
      message: "Address saved successfully.",
      savedAddresses: user.savedAddresses,
    });
  } catch (error) {
    console.error("Error saving address:", error);
    res.status(500).json({ message: "Failed to save address.", error });
  }
});

// Set Default Address
app.put("/addresses/:userId/default/:addressId", async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(addressId)
    ) {
      return res.status(400).json({ message: "Invalid userId or addressId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found with id: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.savedAddresses.find(
      (addr) => addr._id.toString() === addressId
    );

    if (!address) {
      console.error(`Address not found with id: ${addressId}`);
      return res.status(404).json({ message: "Address not found" });
    }

    user.savedAddresses.forEach((addr) => (addr.isDefault = false));
    address.isDefault = true;

    await user.save();

    res.status(200).json({
      message: "Default address updated successfully",
      savedAddresses: user.savedAddresses,
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({ message: "Failed to set default address", error });
  }
});

// Save Product for Later
app.post("/save-for-later/:userId", async (req, res) => {
  try {
    const { product } = req.body; // Expect the product object
    const { userId } = req.params;

    if (!product || !product.productId) {
      return res.status(400).json({ message: "Invalid Product Data" });
    }

    if (!Array.isArray(product.images) || product.images.length === 0) {
      return res.status(400).json({ message: "Product must include images." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isAlreadySaved = user.savedItems.some(
      (item) => item.productId === product.productId
    );

    if (isAlreadySaved) {
      return res.status(400).json({ message: "Product already saved." });
    }

    user.savedItems.push(product);
    await user.save();

    console.log("Product saved for later:", product);
    res.status(200).json({ message: "Product saved for later." });
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).json({ message: "Failed to save product for later." });
  }
});

// Get Saved Items
app.get("/saved-items/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const savedItems = user.savedItems || [];
    console.log("Saved Items:", savedItems);
    res.status(200).json(savedItems);
  } catch (error) {
    console.error("Error fetching saved items:", error);
    res.status(500).json({ message: "Failed to fetch saved items." });
  }
});

// Delete Saved Item
app.delete("/saved-items/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const initialLength = user.savedItems.length;
    user.savedItems = user.savedItems.filter(
      (item) => item.productId !== productId
    );

    if (user.savedItems.length === initialLength) {
      return res
        .status(404)
        .json({ message: "Product not found in saved items." });
    }

    await user.save();
    res.status(200).json({ message: "Item removed from saved items." });
  } catch (error) {
    console.error("Error deleting saved item:", error);
    res.status(500).json({ message: "Failed to delete saved item." });
  }
});

// Send Email
app.post("/send-email", (req, res) => {
  const { name, email, comment } = req.body;

  const mailOptions = {
    from: `"Wall Masters" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `New Contact Form Submission from ${name}`,
    text: `You have a new message from your contact form:

  Name: ${name}
  Email: ${email}
  Comment: ${comment}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({
        message: "Email sending failed",
        error: error.toString(),
      });
    }
    console.log("Email sent:", info.response);
    res.status(200).json({ message: "Email sent successfully!" });
  });
});

// Get User Details (Authenticated)
app.get("/user/details", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ userId: user._id, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve user details" });
  }
});

// Request Password Reset
app.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;
  console.log("Received password reset request for email:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ message: "User not found." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // Expires in 1 hour
    await user.save();

    console.log("Saved reset token:", user.resetToken);
    console.log(
      "Token expiration:",
      new Date(user.resetTokenExpiration).toLocaleString()
    );

    const resetLink = `https://www.wall-masters.com/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: `"Wall Masters" <info@wall-masters.com>`,
      to: email,
      subject: "Password Reset",
      text: `Please use the following link to reset your password: ${resetLink}`,
      html: `<p>Please use the following link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });

    res
      .status(200)
      .json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ message: "Failed to send password reset email." });
  }
});

// Reset Password
app.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  console.log("Received reset token:", token);
  console.log("Received password length:", password.length);

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      console.error("Invalid or expired token.");
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    console.log("Token from DB matches and is not expired.");

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// Retrieve User by ID
app.get("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: "Server error retrieving user", error });
  }
});

// Verify Session
app.get("/auth/verify-session", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    res.status(200).json({ message: "Token is valid" });
  });
});

// Refresh Token Route
app.post("/refresh-token", async (req, res) => {
  try {
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
});

// ------------------ SERVERLESS HANDLER ------------------
const handler = serverless(app);
module.exports.handler = async (event, context) => {
  return await handler(event, context);
};
