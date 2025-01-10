/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async tourId => {
  try {
    const stripe = Stripe(
      'pk_test_51QfN9sFJmXUawGKLFesMsGWOnmoWj2qAC8a5CDPk6UtuJzTcQP5v7LVmg4J1j1tMeewyMLCm4eSFBlXlnr5FpCrR00z4ZplHXI'
    );
    //1)get checkout session from api
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    //2) Create checkout form + chance credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    showAlert('error', err);
  }
};
