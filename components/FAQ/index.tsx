import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faq } from "@/utils/faq";

export function FAQ() {
  return (
    <section className="flex flex-col items-center justify-center space-y-6">
      <h3 className="font-bold text-5xl text-center">
        Frequently Asked Questions
      </h3>
      <span className="text-gray-400 text-center">
        Find answers to common questions about our platform.
      </span>

      <Accordion type="single" className="w-full max-w-2xl">
        {faq.map((questions) => (
          <AccordionItem key={questions.id} value={questions.id}>
            <AccordionTrigger>{questions.trigger}</AccordionTrigger>
            <AccordionContent>{questions.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
