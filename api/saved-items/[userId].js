const { connectToDatabase, User } = require('../_models');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { userId } = req.query;

  if (req.method === 'GET') {
    try {
      await connectToDatabase();
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const savedItems = user.savedItems || [];
      res.status(200).json(savedItems);
    } catch (error) {
      console.error("Error fetching saved items:", error);
      res.status(500).json({ message: "Failed to fetch saved items." });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 