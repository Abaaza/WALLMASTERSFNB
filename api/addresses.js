const { connectToDatabase, User } = require('./_models');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const userId = req.query.userId || req.body.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

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
      res.status(500).json({ message: "Failed to load addresses", error: error.message });
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
      res.status(500).json({ message: "Failed to save address.", error: error.message });
    }
  }
  else if (req.method === 'DELETE') {
    // Delete address
    try {
      await connectToDatabase();
      
      const { addressId } = req.query;
      
      if (!addressId) {
        return res.status(400).json({ message: "Address ID is required" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const addressIndex = user.savedAddresses.findIndex(
        (address) => address._id.toString() === addressId
      );

      if (addressIndex === -1) {
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
      res.status(500).json({ message: "Failed to delete address", error: error.message });
    }
  }
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 