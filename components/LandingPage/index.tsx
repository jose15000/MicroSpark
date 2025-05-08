import { FAQ } from "../FAQ";
import Features from "../Features";
import Header from "../Header";
import { HeroSection } from "../HeroSection";
import Pricing from "../Pricing";
import { Testimomials } from "../Testimonials";
import TrustedCompanies from "../TrustedCompanies";

type Props = {
  palette: string;
};

export default function LandingPage({ palette }: Props) {
  return (
    <div>
      <Header palette={palette} />
      <HeroSection palette={palette} />
      <TrustedCompanies />
      <Features />
      <Testimomials palette={palette} />
      <Pricing palette={palette} />
      <FAQ />
    </div>
  );
}
