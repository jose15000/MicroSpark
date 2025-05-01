import { themes } from "@/utils/themes";
import { Button } from "../ui/button";

type props = {
  theme: string;
};

export function HeroSection({ theme }: props) {
  const selectedTheme = themes.find((t) => t.id === theme);
  return (
    <section className="container mx-auto mt-20">
      <h1 className="font-bold font-Inter text-5xl w-3/6">
        <span
          className={`bg-gradient-to-r ${selectedTheme?.gradientFrom} ${selectedTheme?.gradientTo} bg-clip-text text-transparent`}
        >
          Transforme
        </span>{" "}
        seu problema em solução.
      </h1>
      <h3 className="font-medium font-Inter text-xl w-2/6">
        Uma plataforma simples, moderna e poderosa feita para facilitar sua
        vida.
      </h3>
      <div className="flex flex-row gap-4 mt-5">
        <Button className={`rounded-full ${selectedTheme?.baseColor}`}>
          Comece agora
        </Button>
        <Button variant="outline" className={`rounded-full`}>
          Ver Demo
        </Button>
      </div>
    </section>
  );
}
