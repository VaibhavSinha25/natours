const mongoose = require('mongoose');
const dotenv = require('dotenv');

//handling errors in synchronous codes not the promises example console.log(x); x is not defined
process.on('uncaughtException', err => {
  console.log('Uncaught exception');
  console.log(err);
  process.exit(1);
});
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    // useNewUrlParser: true
    // useUnifiedTopology: true
  })
  .then(() => console.log('Connected to database'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', err => {
  console.log('Unhandled rejection');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
