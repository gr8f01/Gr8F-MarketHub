import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FAQ {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
  title?: string;
  description?: string;
}

export const FAQAccordion = ({
  faqs,
  title = "Frequently Asked Questions",
  description = "Got questions? We've got answers.",
}: FAQAccordionProps) => {
  return (
    <section id="faq" className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl mb-4">{title}</h2>
          <p className="text-neutral-800/80 max-w-2xl mx-auto">
            {description}
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="mb-4 border border-neutral-200 rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-4 hover:bg-neutral-50 font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 py-4 bg-neutral-50 border-t border-neutral-200">
                  <p className="text-neutral-700">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
