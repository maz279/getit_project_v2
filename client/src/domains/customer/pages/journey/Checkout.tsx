/**
 * Checkout Journey Page
 * Amazon.com/Shopee.sg-Level Seamless Checkout Experience
 */

import { SeamlessCheckout } from "../../components/journey/SeamlessCheckout";
import { Helmet } from "react-helmet-async";

export default function CheckoutJourney() {
  return (
    <>
      <Helmet>
        <title>Checkout | GetIt Bangladesh</title>
        <meta name="description" content="Complete your purchase with our secure checkout process. Multiple payment options including bKash, Nagad, and Rocket." />
      </Helmet>
      <SeamlessCheckout />
    </>
  );
}