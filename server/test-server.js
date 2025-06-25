const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock products data
const mockProducts = [
  {
    _id: "1",
    name: "Wall Art Canvas",
    images: ["https://via.placeholder.com/300x200?text=Wall+Art+Canvas"],
    variants: [
      {
        size: "Medium (50x70cm)",
        price: 250,
        displayPrice: "250"
      },
      {
        size: "Large (70x100cm)",
        price: 350,
        displayPrice: "350"
      }
    ]
  },
  {
    _id: "2", 
    name: "Modern Abstract Painting",
    images: ["https://via.placeholder.com/300x200?text=Abstract+Painting"],
    variants: [
      {
        size: "Small (30x40cm)",
        price: 150,
        displayPrice: "150"
      },
      {
        size: "Medium (50x70cm)",
        price: 280,
        displayPrice: "280"
      }
    ]
  },
  {
    _id: "3",
    name: "Decorative Mirror",
    images: ["https://via.placeholder.com/300x200?text=Decorative+Mirror"],
    variants: [
      {
        size: "Round (60cm)",
        price: 400,
        displayPrice: "400"
      }
    ]
  }
];

// Routes
app.get('/', (req, res) => {
  res.send('Test Server Running!');
});

app.get('/products', (req, res) => {
  console.log('Products endpoint called');
  res.json(mockProducts);
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
}); 