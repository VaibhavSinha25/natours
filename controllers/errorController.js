const AppError = require('../utils/appError');

const sendErrorDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    //Rendered website
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    //API
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
  //Rendered Website
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    });
  }
  // Programming or other unknown error: don't leak error details
  console.error('ERROR 💥', err);
  return res.status(500).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later'
  });
};

const handleJWTExpiredError = err =>
  new AppError('Your token has expired! Please log in again.', 401);
const handleJWTError = err =>
  new AppError('Invalid token. Please log in again!', 401);
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data ... ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = err => {
  console.log(err.keyValue.name);
  const value = err.keyValue.name;
  const message = `Duplicate field value ${value} Please use a different value`;
  return new AppError(message, 400);
};
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400); // Change to 404 if you want to indicate a not found error
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  console.log(`Environment: '${process.env.NODE_ENV}'`);
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(error);
    sendErrorProd(error, req, res);
  }
};
