import HeroSection from "@/components/Home/HeroSection";
import StatsOverview from "@/components/Home/StatsOverview";
import PollPreview from "@/components/Home/PollPreview";
import WalletPrompt from "@/components/Home/WalletPrompt";
export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <StatsOverview />
      <PollPreview />
      <WalletPrompt />
    </div>
  );
}
