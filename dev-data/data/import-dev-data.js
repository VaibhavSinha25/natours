const fs = require('fs');

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const Tour = require('../../models/tourModel');
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
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to Mongoose');
  });

//Read json file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

//import into database
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully created');
    process.exit();
  } catch (err) {
    console.error('Error importing data', err);
  }
};
//Delete all data from Collection
const deleteData = async () => {
  try {
    await Tour.deleteMany();

    console.log('Data successfully deleted');
    process.exit();
  } catch (err) {
    console.error('Error deleting data', err);
  }
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
