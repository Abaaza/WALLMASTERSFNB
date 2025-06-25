const { connectToDatabase, User } = require('../../_models');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { userId, productId } = req.query;

  try {
    await connectToDatabase();
    
    const user = await User.findById(userId);
    if (!user) {
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
}; 