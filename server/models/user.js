const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  savedAddresses: {
    type: [
      {
        name: String,
        email: String,
        mobileNo: String,
        houseNo: String,
        street: String,
        city: String,
        postalCode: { type: String, default: null },
        isDefault: { type: Boolean, default: false },
        country: String,
      },
    ],
    default: [],
  },
  savedItems: [
    {
      productId: String,
      name: String,
      price: Number,
      image: String,
    },
  ],
  resetToken: { type: String, default: null },
  resetTokenExpiration: { type: Date, default: null },

  // Add the refreshToken field here
  refreshToken: { type: String, default: null },
});

// Pre-save hook for duplicate address validation
userSchema.pre("save", function (next) {
  const addresses = this.savedAddresses;

  const normalizeString = (str) => (str || "").trim().toLowerCase();
  const seenAddresses = new Set();

  for (const address of addresses) {
    const addressKey = JSON.stringify({
      name: normalizeString(address.name),
      email: normalizeString(address.email),
      mobileNo: normalizeString(address.mobileNo),
      houseNo: normalizeString(address.houseNo),
      street: normalizeString(address.street),
      city: normalizeString(address.city),
      postalCode: normalizeString(address.postalCode),
      country: normalizeString(address.country),
    });

    if (seenAddresses.has(addressKey)) {
      const error = new Error("Duplicate address detected");
      error.statusCode = 409; // Conflict
      return next(error);
    }

    seenAddresses.add(addressKey);
  }

  next();
});

module.exports = mongoose.model("User", userSchema);
