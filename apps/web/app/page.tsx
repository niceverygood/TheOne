import { Hero } from '@/components/landing/hero';
import { ProofStrip } from '@/components/landing/proof-strip';
import { HowItWorks } from '@/components/landing/how-it-works';
import { VerificationFour } from '@/components/landing/verification-four';
import { Founding } from '@/components/landing/founding';
import { Faq } from '@/components/landing/faq';
import { WaitlistSection } from '@/components/landing/waitlist-section';
import { SiteFooter } from '@/components/landing/site-footer';
import { JsonLd } from '@/components/seo/json-ld';

export default function HomePage() {
  return (
    <main>
      <JsonLd />
      <Hero />
      <ProofStrip />
      <HowItWorks />
      <VerificationFour />
      <Founding />
      <WaitlistSection />
      <Faq />
      <SiteFooter />
    </main>
  );
}
