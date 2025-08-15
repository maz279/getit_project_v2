/**
 * Order Tracking Journey Page
 * Amazon.com/Shopee.sg-Level Order Tracking Experience
 */

// import { OrderTrackingSystem } from "@/components/customer/journey/OrderTrackingSystem";
// Temporary placeholder until OrderTrackingSystem component is available
const OrderTrackingSystem = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center p-8">
      <h1 className="text-3xl font-bold mb-4">Order Tracking</h1>
      <p className="text-gray-600">Order tracking system coming soon...</p>
    </div>
  </div>
);
import { Helmet } from "react-helmet-async";

export default function OrderTrackingJourney() {
  return (
    <>
      <Helmet>
        <title>Track Your Order | GetIt Bangladesh</title>
        <meta name="description" content="Track your order in real-time with GPS tracking, delivery updates, and communication with delivery personnel." />
      </Helmet>
      <OrderTrackingSystem />
    </>
  );
}