import { features } from "@/utils/features";
import { FeatureCards } from "./featureCard";

export default function Features() {
  return (
    <section className="flex flex-col items-center justify-center">
      <h2 className="rounded-full p-2 text-5xl font-bold mb-3">Features</h2>
      <span className="text-lg w-3/6 text-center text-gray-400">
        Our comprehensive platform provides all the tools you need to streamline
        your workflow, boost productivity, and achieve your goals.
      </span>
      <div className="flex flex-col md:grid grid-cols-2 gap-5 mt-10">
        {features.map((feature) => (
          <FeatureCards
            key={feature.id}
            title={feature.title}
            text={feature.text}
            Icon={feature.icon}
          />
        ))}
      </div>
    </section>
  );
}
