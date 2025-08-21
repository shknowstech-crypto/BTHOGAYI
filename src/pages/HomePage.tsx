import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { HowItWorksSection } from '@/components/landing/how-it-works'
import { CampusMapSection } from '@/components/landing/campus-map'
import { TestimonialsSection } from '@/components/landing/testimonials'
import { TrustSafetySection } from '@/components/landing/trust-safety'
import { FAQSection } from '@/components/landing/faq-section'
import { CTASection } from '@/components/landing/cta-section'
import { Footer } from '@/components/landing/footer'

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CampusMapSection />
      <TestimonialsSection />
      <TrustSafetySection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  )
}