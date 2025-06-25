const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Mock products data
const products = [
  {
    _id: "1",
    name: "Modern Wall Art",
    images: ["https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400"],
    variants: [
      { size: "Small", price: 150, displayPrice: "150" },
      { size: "Medium", price: 250, displayPrice: "250" }
    ]
  },
  {
    _id: "2", 
    name: "Abstract Canvas",
    images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"],
    variants: [
      { size: "Large", price: 350, displayPrice: "350" }
    ]
  },
  {
    _id: "3",
    name: "Vintage Poster",
    images: ["https://images.unsplash.com/photo-1578661996442-48f60103fc96?w=400"],
    variants: [
      { size: "Medium", price: 200, displayPrice: "200" }
    ]
  }
];

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'Wall Masters API Server is running!' });
});

app.get('/products', (req, res) => {
  console.log('Products requested');
  res.json(products);
});

app.get('/api/products', (req, res) => {
  console.log('API Products requested');
  res.json(products);
});

app.listen(PORT, () => {
  console.log(`Quick server running on http://localhost:${PORT}`);
}); 