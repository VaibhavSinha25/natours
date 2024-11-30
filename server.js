const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
// console.log(app.get('env'));
// console.log(process.env);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(con => {});

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

//think of it as object
const testTour = new Tour({
  name: 'Park Camper',
  price: 999
});
testTour
  .save()
  .then(doc => {
    console.log(doc);
  })
  .catch(err => console.log(err));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('listening on port');
});
