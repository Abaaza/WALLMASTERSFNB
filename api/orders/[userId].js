const { connectToDatabase, Order } = require('../_models');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await connectToDatabase();
    
    const { userId } = req.query;
    const orders = await Order.find({ user: userId });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ 
      message: "Failed to fetch orders", 
      error: error.message 
    });
  }
}; 