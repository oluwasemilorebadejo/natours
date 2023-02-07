/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    await axios({
      method: "POST",
      url: `/api/v1/bookings/create-checkout-session/${tourId}`,
      tourId,
    });

    // const checkoutSession = response.data;
    // console.log(checkoutSession);

    // // 2) Create checkout form and charge credit card
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
    // });
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }
};
