import { palettes } from "@/utils/palettes";
import { Button } from "../ui/button";

type props = {
  palette: string;
};

export function HeroSection({ palette }: props) {
  const selectedpalette = palettes.find((t) => t.id === palette);
  return (
    <section className="container mx-auto mt-52">
      <h1 className="font-black font-Inter text-5xl w-3/6">
        <span
          className={`bg-gradient-to-r ${selectedpalette?.gradientFrom} ${selectedpalette?.gradientTo} bg-clip-text text-transparent`}
        >
          Transforme
        </span>{" "}
        seu problema em solução.
      </h1>
      <h3 className="font-medium font-Inter text-xl w-2/6 text-gray-600 my-5">
        Uma plataforma simples, moderna e poderosa feita para facilitar sua
        vida.
      </h3>
      <div className="flex flex-row gap-4 mt-5">
        <Button
          className={`rounded-full ${selectedpalette?.baseColor} dark:text-white`}
          variant="default"
        >
          Comece agora
        </Button>
        <Button variant="outline">Ver Demo</Button>
      </div>
    </section>
  );
}
