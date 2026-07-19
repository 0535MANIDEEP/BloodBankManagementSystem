const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodGroup: {
    type: String,
    required: [true, 'Please specify the required blood group'],
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  units: {
    type: Number,
    required: [true, 'Please specify units requested'],
    min: [1, 'Must request at least 1 unit']
  },
  priority: {
    type: String,
    enum: ['Normal', 'Emergency'],
    default: 'Normal'
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  message: {
    type: String
  },
  assignedUnits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Request', RequestSchema);
