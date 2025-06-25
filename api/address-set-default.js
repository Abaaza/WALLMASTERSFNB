const { connectToDatabase, User } = require('./_models');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await connectToDatabase();
    
    const { userId, addressId } = req.query;
    
    if (!userId || !addressId) {
      return res.status(400).json({ message: "User ID and Address ID are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.savedAddresses.find(
      (addr) => addr._id.toString() === addressId
    );

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Set all addresses to non-default
    user.savedAddresses.forEach((addr) => (addr.isDefault = false));
    // Set the selected address as default
    address.isDefault = true;

    await user.save();

    res.status(200).json({
      message: "Default address updated successfully",
      savedAddresses: user.savedAddresses,
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({ message: "Failed to set default address", error: error.message });
  }
}; 