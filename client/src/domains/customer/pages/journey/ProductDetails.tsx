/**
 * Product Details Journey Page
 * Amazon.com/Shopee.sg-Level Product Details Experience
 */

import { EnhancedProductDetails } from "../../components/journey/EnhancedProductDetails";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

export default function ProductDetailsJourney() {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <Helmet>
        <title>Product Details | GetIt Bangladesh</title>
        <meta name="description" content="View detailed product information, reviews, specifications, and vendor details. Make informed purchasing decisions." />
      </Helmet>
      <EnhancedProductDetails productId={id} />
    </>
  );
}