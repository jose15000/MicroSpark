import { palettes } from "@/utils/palettes";
import { Button } from "../ui/button";

type props = {
  palette: string;
};

export default function Header({ palette }: props) {
  const selectedpalette = palettes.find((t) => t.id === palette);
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="ml-10 text-xl font-bold flex items-center gap-1">
          MicroSpark
        </div>

        <nav className="absolute left-1/2 transform -translate-x-1/2 flex gap-6">
          <a href="#features" className={`${selectedpalette?.hover}`}>
            Features
          </a>
          <a href="#testimonials" className={`${selectedpalette?.hover}`}>
            Testimonials
          </a>
          <a href="#pricing" className={`${selectedpalette?.hover}`}>
            Pricing
          </a>
        </nav>
        <Button
          variant="default"
          className={`rounded-full ${selectedpalette?.baseColor} dark:text-white`}
        >
          Get Started
        </Button>
      </div>
    </header>
  );
}
