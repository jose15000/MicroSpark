import { Testimonials } from "@/utils/testimonials";
import TestimonialCard from "./TestimonialCard";

type props = {
  palette: string;
};
export function Testimomials({ palette }: props) {
  return (
    <section
      className="flex flex-col items-center justify-center mt-40"
      id="#testimonials"
    >
      <h2 className="flex font-bold text-5xl mb-5">What Our Customers Say</h2>
      <span className="flex text-gray-400">
        Don't just take our word for it. Here's what our customers have to say.
      </span>
      <div className="flex flex-row gap-2 mt-10">
        {Testimonials.map((testimonial) => (
          <div key={testimonial.id}>
            <TestimonialCard
              name={testimonial.name}
              role={testimonial.role}
              comment={testimonial.comment}
              palette={palette}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
