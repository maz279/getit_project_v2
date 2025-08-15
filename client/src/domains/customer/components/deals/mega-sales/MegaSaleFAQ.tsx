
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion';

export const MegaSaleFAQ: React.FC = () => {
  const faqs = [
    {
      question: "How long does the Mega Sale last?",
      answer: "Our Mega Sale runs for 7 days with fresh deals added daily. Some flash deals may have shorter durations (2-24 hours)."
    },
    {
      question: "Are the discounts genuine?",
      answer: "Yes! All our discounts are based on our regular selling prices. We guarantee authentic products at the lowest prices."
    },
    {
      question: "Can I return sale items?",
      answer: "Absolutely! Our 30-day return policy applies to all sale items. Free returns for defective products."
    },
    {
      question: "Do you offer EMI on sale items?",
      answer: "Yes, EMI options are available on electronics and home appliances above ৳10,000 with 0% interest for 6-12 months."
    },
    {
      question: "How fast is delivery during the sale?",
      answer: "We maintain our standard delivery times: 24 hours in Dhaka, 2-3 days nationwide. Express delivery available."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">❓ Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">Everything you need to know about our Mega Sale</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Mega Sale FAQ</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
