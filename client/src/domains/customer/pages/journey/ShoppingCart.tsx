/**
 * Shopping Cart Journey Page
 * Amazon.com/Shopee.sg-Level Smart Shopping Cart Experience
 */

// import { SmartShoppingCart } from "@/components/customer/journey/SmartShoppingCart";
// Temporary placeholder until SmartShoppingCart component is available
const SmartShoppingCart = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center p-8">
      <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
      <p className="text-gray-600">Smart shopping cart functionality coming soon...</p>
    </div>
  </div>
);
import { Helmet } from "react-helmet-async";

export default function ShoppingCartJourney() {
  return (
    <>
      <Helmet>
        <title>Shopping Cart | GetIt Bangladesh</title>
        <meta name="description" content="Review your cart, apply coupons, calculate shipping, and proceed to checkout. Smart cart management with price tracking." />
      </Helmet>
      <SmartShoppingCart />
    </>
  );
}