const mongoose = require('mongoose');

// Cache connection
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.CONNECTION_STRING, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  refreshToken: String,
  resetToken: String,
  resetTokenExpiration: Date,
  savedAddresses: [{
    name: String,
    email: String,
    mobileNo: String,
    houseNo: String,
    street: String,
    city: String,
    postalCode: String,
    isDefault: Boolean
  }],
  savedItems: [{
    productId: String,
    name: String,
    images: [String],
    variants: Array,
    theme: String,
    color: [String]
  }]
});

// Product Schema
const productSchema = new mongoose.Schema({}, { collection: "products", strict: false });

// Order Schema
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  user: String,
  products: [{
    productId: String,
    name: String,
    quantity: Number,
    price: Number,
    size: String
  }],
  totalPrice: Number,
  shippingAddress: {
    name: String,
    email: String,
    mobileNo: String,
    houseNo: String,
    street: String,
    city: String,
    postalCode: String
  },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = {
  connectToDatabase,
  User,
  Product,
  Order
}; 