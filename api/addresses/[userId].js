const mongoose = require('mongoose');
const { connectToDatabase, User } = require('../_models');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { userId } = req.query;

  if (req.method === 'GET') {
    // Retrieve addresses
    try {
      await connectToDatabase();
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user.savedAddresses || []);
    } catch (error) {
      console.error("Error loading addresses:", error);
      res.status(500).json({ message: "Failed to load addresses", error });
    }
  } 
  else if (req.method === 'POST') {
    // Save new address
    try {
      await connectToDatabase();
      
      const newAddress = req.body.address;
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
          normalizeString(savedAddress.name) === normalizeString(newAddress.name) &&
          normalizeString(savedAddress.email) === normalizeString(newAddress.email) &&
          normalizeString(savedAddress.mobileNo) === normalizeString(newAddress.mobileNo) &&
          normalizeString(savedAddress.houseNo) === normalizeString(newAddress.houseNo) &&
          normalizeString(savedAddress.street) === normalizeString(newAddress.street) &&
          normalizeString(savedAddress.city) === normalizeString(newAddress.city) &&
          normalizeString(savedAddress.postalCode) === normalizeString(newAddress.postalCode)
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
  }
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 