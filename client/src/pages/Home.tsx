```tsx
import { useAuth } from "@/_core/hooks/useAuth";
import { SignInButton } from "@clerk/clerk-react";
import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  CheckCircle,
  BarChart3,
  Users,
  Zap,
  ArrowRight,
  Star,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* ── Sticky Navbar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">RetainIQ</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
              Pricing
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-4">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="h-10 px-4 text-gray-700">
                    Sign In
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-4">
                    Get Started Free
                  </Button>
                </SignInButton>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
            <a
              href="#features"
              className="text-sm font-medium text-gray-700 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-gray-700 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-10">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full h-10">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-10">
                      Get Started Free
                    </Button>
                  </SignInButton>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20 md:py-32 px-4 md:px-8">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-indigo-100 opacity-60 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-purple-100 opacity-60 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto text-center">
            <Badge className="mb-6 bg-indigo-100 text-indigo-700 border-indigo-200 px-4 py-1 text-sm font-medium">
              🚀 AI-Powered Customer Retention
            </Badge>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Retain More Customers.{" "}
              <span className="text-indigo-600">Grow Revenue.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              RetainIQ uses intelligent automation and personalized messaging to reduce churn,
              re-engage at-risk customers, and drive long-term loyalty — all on autopilot.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 text-base font-semibold">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 text-base font-semibold">
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base font-semibold border-gray-300 text-gray-700 hover:bg-gray-50">
                      See a Demo
                    </Button>
                  </SignInButton>
                </>
              )}
            </div>

            <p className="mt-6 text-sm text-gray-500">
              No credit card required · 14-day free trial · Cancel anytime
            </p>

            {/* Social proof */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 font-medium text-gray-700">4.9/5 rating</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-200" />
              <span>Trusted by <strong className="text-gray-700">500+</strong> e-commerce brands</span>
              <div className="hidden sm:block w-px h-4 bg-gray-200" />
              <span><strong className="text-gray-700">$12M+</strong> revenue recovered</span>
            </div>
          </div>
        </section>

        {/* ── Features Section ── */}
        <section id="features" className="py-20 md:py-28 px-4 md:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200 px-3 py-1 text-sm">
                Features
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything you need to retain customers
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                RetainIQ gives your team a complete toolkit to identify churn risks early
                and act on them automatically — before it's too late.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="w-6 h-6 text-indigo-600" />,
                  title: "AI-Powered Churn Prediction",
                  description:
                    "Our machine learning models analyze behavior signals to flag at-risk customers days before they churn, giving you time to act.",
                },
                {
                  icon: <MessageSquare className="w-6 h-6 text-indigo-600" />,
                  title: "Personalized Win-Back Campaigns",
                  description:
                    "Automatically send hyper-personalized emails, SMS, and push notifications tailored to each customer's history and preferences.",
                },
                {
                  icon: <BarChart3 className="w-6 h-6 text-indigo-600" />,
                  title: "Retention Analytics Dashboard",
                  description:
                    "Track churn rate, LTV trends, campaign performance, and revenue impact in one unified, real-time dashboard.",
                },
                {
                  icon: <Users className="w-6 h-6 text-indigo-600" />,
                  title: "Customer Segmentation",
                  description:
                    "Group customers by risk level, purchase frequency, product affinity, and more to deliver the right message at the right time.",
                },
                {
                  icon: <TrendingUp className="w-6 h-6 text-indigo-600" />,
                  title: "LTV Optimization",
                  description:
                    "Identify your highest-value customers and create loyalty programs that keep them engaged and spending more over time.",
                },
                {
                  icon: <CheckCircle className="w-6 h-6 text-indigo-600" />,
                  title: "One-Click Integrations",
                  description:
                    "Connect with Shopify, WooCommerce, Klaviyo, Stripe, and 50+ other platforms in minutes — no engineering required.",
                },
              ].map((feature, idx) => (
                <Card key={idx} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social Proof / Stats ── */}
        <section className="py-16 md:py-20 px-4 md:px-8 bg-indigo-600">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-white">
              {[
                { stat: "35%", label: "Average reduction in churn rate" },
                { stat: "4.2×", label: "Return on investment in year one" },
                { stat: "48h", label: "Average setup time to first campaign" },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-4xl md:text-5xl font-bold mb-2">{item.stat}</span>
                  <span className="text-indigo-200 text-sm md:text-base">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing Section ── */}
        <section id="pricing" className="py-20 md:py-28 px-4 md:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200 px-3 py-1 text-sm">
                Pricing
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose the plan that fits your business. Upgrade or downgrade at any time.
                All plans include a 14-day free trial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter */}
              <Card className="border border-gray-200 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Starter</div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-gray-900">$49</span>
                    <span className="text-gray-500 mb-1">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Perfect for small stores just getting started with retention.
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <ul className="space-y-3">
                    {[
                      "Up to 1,000 customers",
                      "Churn prediction alerts",
                      "Email win-back campaigns",
                      "Basic analytics dashboard",
                      "2 integrations",
                      "Email support",
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full h-10 mt-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                      Start Free Trial
                    </Button>
                  </SignInButton>
                </CardContent>
              </Card>

              {/* Growth — highlighted */}
              <Card className="border-2 border-indigo-600 shadow-lg bg-white relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-indigo-600 text-white px-4 py-1 text-sm font-semibold shadow">
                    Most Popular
                  </Badge>
                </div>
                <CardHeader className="pb-4 pt-8">
                  <div className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2">Growth</div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-gray-900">$149</span>
                    <span className="text-gray-500 mb-1">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    For scaling brands serious about reducing churn and growing LTV.
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <ul className="space-y-3">
                    {[
                      "Up to 10,000 customers",
                      "Advanced AI churn prediction",
                      "Email, SMS & push campaigns",
                      "Customer segmentation",
                      "Full analytics & LTV reports",
                      "20 integrations",
                      "Priority email & chat support",
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <SignInButton mode="modal">
                    <Button className="w-full h-10 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                      Start Free Trial
                    </Button>
                  </SignInButton>
                </CardContent>
              </Card>

              {/* Enterprise */}
              <Card className="border border-gray-200 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Enterprise</div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-gray-900">$399</span>
                    <span className="text-gray-500 mb-1">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    For high-volume merchants and agencies managing multiple brands.
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <ul className="space-y-3">
                    {[
                      "Unlimited customers",
                      "Custom AI model training",
                      "All campaign channels",
                      "Advanced segmentation & A/B tests",
                      "White-glove onboarding",
                      "Unlimited integrations",
                      "Dedicated account manager",
                      "SLA & SSO support",
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full h-10 mt-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                      Start Free Trial
                    </Button>
                  </SignInButton>
                </CardContent>
              </Card>
            </div>

            <p className="text-center text-sm text-gray-500 mt-8">
              All plans include a 14-day free trial. No credit card required to start.
            </p>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="py-20 md:py-28 px-4 md:px-8 bg-gradient-to-br from-indigo-600 to-purple-700">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to stop losing customers?
            </h2>
            <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
              Join 500+ e-commerce brands using RetainIQ to reduce churn and unlock hidden revenue.
              Start your free 14-day trial today — no credit card needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-white text-indigo-600 hover:bg-indigo-50 font-semibold text-base">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-white text-indigo-600 hover:bg-indigo-50 font-semibold text-base">
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto h-12 px-8 border-white text-white hover:bg-white/10 font-semibold text-base bg-transparent"
                    >
                      Schedule a Demo
                    </Button>
                  </SignInButton>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">RetainIQ</span>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </a>
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
            </nav>

            {/* Copyright */}
            <p className="text-sm text-center md:text-right">
              © {new Date().getFullYear()} RetainIQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
// END_OF_FILE