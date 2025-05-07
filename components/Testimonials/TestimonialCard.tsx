import { palettes } from "@/utils/palettes";
import { Star, Quote } from "lucide-react";

type props = {
  name: string;
  photo?: string;
  comment: string;
  role: string;
  palette: string;
};

export default function TestimonialCard({
  comment,
  name,
  photo,
  role,
  palette,
}: props) {
  const selectedpalette = palettes.find((t) => t.id === palette);

  return (
    <div className="w-full max-w-sm bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <Quote className="text-gray-500 mb-3 h-6 w-6" />
      <div className="mb-4 flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className="h-5 w-5 text-amber-500 fill-amber-500" />
        ))}
      </div>
      <p className="text-gray-300 mb-6 italic text-sm md:text-base w-full">
        {comment}
      </p>
      <div className="flex flex-row items-center gap-3 mt-2">
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="rounded-full w-12 h-12 object-cover"
          />
        ) : (
          <div
            className={`rounded-full bg-gradient-to-r ${selectedpalette?.gradientFrom} ${selectedpalette?.gradientTo} w-12 h-12 flex items-center justify-center text-white font-bold text-l`}
          >
            {name.charAt(0)}
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-semibold text-white">{name}</span>
          <span className="text-sm text-gray-400">{role}</span>
        </div>
      </div>
    </div>
  );
}
