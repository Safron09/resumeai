import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import HowItWorks from '../components/landing/HowItWorks'
import Features from '../components/landing/Features'
import HumanizationExplainer from '../components/landing/HumanizationExplainer'
import PricingSection from '../components/landing/PricingSection'
import Footer from '../components/landing/Footer'

export default function Landing() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  if (isLoggedIn) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-bg text-gray-100">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <HumanizationExplainer />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
