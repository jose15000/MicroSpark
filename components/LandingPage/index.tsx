import Header from "../Header";
import { HeroSection } from "../HeroSection";

type Props = {
  theme: string;
};

export default function LandingPage({ theme }: Props) {
  return (
    <div>
      <Header theme={theme} />
      <HeroSection theme={theme} />
    </div>
  );
}
