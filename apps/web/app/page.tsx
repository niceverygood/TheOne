import { Hero } from '@/components/landing/hero';
import { ProofStrip } from '@/components/landing/proof-strip';
import { HowItWorks } from '@/components/landing/how-it-works';
import { VerificationFour } from '@/components/landing/verification-four';
import { Faq } from '@/components/landing/faq';
import { WaitlistSection } from '@/components/landing/waitlist-section';
import { SiteFooter } from '@/components/landing/site-footer';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ProofStrip />
      <HowItWorks />
      <VerificationFour />
      <WaitlistSection />
      <Faq />
      <SiteFooter />
    </main>
  );
}
