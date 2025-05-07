import { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  title: string;
  text: string;
  Icon: LucideIcon;
};

export const FeatureCards = ({ title, text, Icon }: FeatureCardProps) => {
  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="rounded-full bg-blue-500/10 w-12 h-12 flex items-center justify-center mb-4">
        <Icon />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{text}</p>
    </div>
  );
};
