const mongoose = require('mongoose');
//think of it as a class
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  }
});

//think of it as a constructor function that creates a new instance of Tour
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
