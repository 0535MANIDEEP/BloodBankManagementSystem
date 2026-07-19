const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  bloodGroup: {
    type: String,
    required: [true, 'Please specify the blood group'],
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  units: {
    type: Number,
    required: [true, 'Please specify quantity of units'],
    min: [0, 'Units cannot be negative']
  },
  status: {
    type: String,
    enum: ['available', 'expired', 'assigned'],
    default: 'available'
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please specify the expiry date']
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  addedDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inventory', InventorySchema);
