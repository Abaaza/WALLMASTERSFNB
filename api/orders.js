const { connectToDatabase, Order } = require('./_models');

// Utility function to generate order ID
const generateOrderId = () => {
  const datePart = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${datePart}-${randomPart}`;
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      await connectToDatabase();
      
      const { products, totalPrice, shippingAddress, userId } = req.body;

      const newOrder = new Order({
        orderId: generateOrderId(),
        user: userId || "guest",
        products,
        totalPrice,
        shippingAddress,
      });

      await newOrder.save();

      res.status(201).json({
        message: "Order placed successfully.",
        order: newOrder,
      });
    } catch (error) {
      console.error("Order placement failed:", error);
      if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message });
      }
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ message: "Duplicate order detected. Please try again." });
      }
      res.status(500).json({ message: "Order placement failed" });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 