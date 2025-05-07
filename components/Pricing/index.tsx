import { plans } from "@/utils/planFeatures";
import { PriceCard } from "./priceCard";

type props = {
  palette: string;
};

export default function Pricing({ palette }: props) {
  return (
    <section className="flex flex-col items-center justify-center mt-40">
      <h3 className="text-5xl font-bold">Simple, Transparent Pricing</h3>
      <span className="flex text-gray-400 mt-5">
        Choose the plan that's right for your business. All plans include a
        14-day free trial.
      </span>

      <div className="flex flex-col md:flex-row gap-2">
        {plans.map((plan) => (
          <PriceCard
            palette={palette}
            key={plan.id}
            title={plan.name}
            price={plan.price}
            features={plan.features}
            subtext={plan.description}
            buttonText={plan.buttonText}
            popular={plan.popular!}
            priceId={plan.priceId}
          />
        ))}
      </div>
    </section>
  );
}
