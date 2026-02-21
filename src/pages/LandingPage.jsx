import HeroSection from '../components/HeroSection'
import SocialProofStrip from '../components/SocialProofStrip'
import PitchSection from '../components/PitchSection'
import HowItWorks from '../components/HowItWorks'
import DestinationCards from '../components/DestinationCards'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'

const LandingPage = () => {
  return (
    <main>
      <HeroSection />
      <SocialProofStrip />
      <PitchSection />
      <HowItWorks />
      <DestinationCards />
      <CTASection />
      <Footer />
    </main>
  )
}

export default LandingPage
