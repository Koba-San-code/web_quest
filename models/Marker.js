const mongoose = require('mongoose');

const MarkerSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    default: 'Новая метка'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Marker', MarkerSchema);
