const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const factory = require('../controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async function(req, res) {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourID);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/my-tours?tour=${
    //   req.params.tourID
    // }&user=${req.user.id}&price=${tour.price}`, //NOT AT ALL SECURE
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`
            ]
          },
          unit_amount: tour.price * 100 // Stripe expects the amount in cents
        },
        quantity: 1
      }
    ],
    mode: 'payment' // Ensure mode is set to 'payment'
  });

  // 3) Send the session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   //This is only temporary becaue its unsecure everyone can make bookings without payments
//   const { tour, user, price } = req.query;
//   if (!tour && !user && !price) return next();
//   await Booking.create({ tour, user, price });
//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = async session => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  // const price = session.line_items[0].unit_amount / 100;
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  // Use unit_amount if you only want the price per item
  const price = lineItems.data[0].price.unit_amount / 100;
  await Booking.create({ tour, user, price });
};
exports.webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (e) {
    return res.status(400).send(`Webhook error : ${e.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    await createBookingCheckout(event.data.object);
    res.status(200).json({ received: true });
  }
};
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
