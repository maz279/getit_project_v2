/**
 * Product Discovery Journey Page
 * Amazon.com/Shopee.sg-Level Product Discovery Experience
 */

import { ProductDiscoveryEngine } from "../../journey/ProductDiscoveryEngine";
import { Helmet } from "react-helmet-async";

export default function ProductDiscoveryJourney() {
  return (
    <>
      <Helmet>
        <title>Discover Products | GetIt Bangladesh</title>
        <meta name="description" content="Discover amazing products with our AI-powered recommendation engine. Find exactly what you're looking for with personalized suggestions." />
      </Helmet>
      <ProductDiscoveryEngine />
    </>
  );
}