import { themes } from "@/utils/themes";
import { Button } from "../ui/button";

type props = {
  theme: string;
};

export default function Header({ theme }: props) {
  const selectedTheme = themes.find((t) => t.id === theme);
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="ml-10 text-xl font-bold flex items-center gap-1">
          MicroSpark
        </div>

        <nav className="absolute left-1/2 transform -translate-x-1/2 flex gap-6">
          <a href="#features" className={``}>
            Features
          </a>
          <a href="#testimonials" className={``}>
            Testimonials
          </a>
          <a href="#pricing" className="hover:underline">
            Pricing
          </a>
        </nav>
        <Button
          variant="default"
          className={`rounded-full ${selectedTheme?.baseColor}`}
        >
          Get Started
        </Button>
      </div>
    </header>
  );
}
