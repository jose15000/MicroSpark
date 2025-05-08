"use client";

import { palettes } from "@/utils/palettes";
import { loadStripe } from "@stripe/stripe-js";
import { Check } from "lucide-react";
import { Button } from "../ui/button";

type props = {
  title: string;
  price: string;
  subtext: string;
  features: string[];
  buttonText: string;
  popular: boolean;
  palette: string;
  priceId: string;
};

export function PriceCard({
  title,
  price,
  features,
  buttonText,
  subtext,
  popular,
  palette,
  priceId,
}: props) {
  const selectedpalette = palettes.find((t) => t.id === palette);

  const handleCheckout = async () => {
    const response = await fetch("api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId: priceId }),
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Erro ao redirecionar para o checkout.");
    }
  };

  return (
    <>
      <div className="relative w-full">
        {popular && (
          <div
            className={`absolute top-2 right-2 bg-gradient-to-r ${selectedpalette?.gradientTo} ${selectedpalette?.gradientFrom}  text-xs font-semibold px-3 py-1 rounded-full shadow`}
          >
            Popular
          </div>
        )}

        <div
          className={`flex flex-col justify-start bg-gray-900 p-5 rounded-2xl mt-4 w-full ${
            popular ? `${selectedpalette?.border}` : "border border-gray-700/50"
          }`}
        >
          <h3 className="text-3xl font-bold mb-3">{title}</h3>
          <div className="flex flex-row items-center gap-2">
            <h3 className="text-4xl font-bold">{price}</h3>
            <span className="text-gray-400">/month</span>
          </div>
          <span className="w-3/6">{subtext}</span>
          <div className="flex flex-col gap-2 my-4">
            {features.map((feature, index) => (
              <span
                key={index}
                className="flex flex-row text-sm text-gray-300 gap-2"
              >
                <Check size={20} /> {feature}
              </span>
            ))}
          </div>
          <button
            className={`rounded-full bg-gray-600 py-3 hover:cursor-pointer hover:bg-gray-500 ${
              popular
                ? ` bg-gradient-to-r ${selectedpalette?.gradientFrom} ${selectedpalette?.gradientTo}`
                : ""
            }`}
            onClick={handleCheckout}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </>
  );
}
